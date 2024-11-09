"use client";

import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { createClient } from "@/utils/supabase/client";
import "@tensorflow/tfjs";
import * as faceapi from "face-api.js";
import cv from "opencv.js";

const ObjectDetection = () => {
  console.log("ObjectDetection component is rendering");

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State variables
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [user, setUser] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);

  const supabase = createClient();

  // Refs for intervals and time tracking
  const detectionBuffer = useRef([]);
  const detectionIntervalId = useRef(null);
  const lastLoggedTime = useRef(0);

  const detectionIntervalMs = 10;
  const slowedDetectionIntervalMs = 1000;
  const supabasePostReqIntervalMs = 2000;

  // Refs for classifiers
  const fireClassifier = useRef(null);
  const gunClassifier = useRef(null);

  useEffect(() => {
    console.log("Fetching user data useEffect triggered");
    const getUser = async () => {
      try {
        console.log("Attempting to fetch user data");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        console.log("User fetched:", user);
        setUser(user);

        if (user) {
          const { data: membersData, error: membersError } = await supabase
            .from("members")
            .select("descriptor, member_id, first_name, last_name")
            .eq("team_id", user.id);

          if (membersError) {
            console.error("Error fetching descriptors:", membersError);
          } else {
            console.log("Members data:", membersData);

            const labeledDescriptorsList = membersData.map((member) => {
              const floatArray = Float32Array.from(member.descriptor);
              console.log(
                "Converted descriptor for",
                member.first_name,
                member.last_name,
                floatArray
              );
              return new faceapi.LabeledFaceDescriptors(
                `${member.first_name} ${member.last_name}` ||
                  `ID: ${member.member_id}`,
                [floatArray]
              );
            });

            setLabeledDescriptors(labeledDescriptorsList);
            console.log(
              "Labeled Descriptors from database:",
              labeledDescriptorsList
            );
          }
        } else {
          console.warn("No user logged in");
        }
      } catch (error) {
        console.error("Error fetching user or descriptors:", error);
      }
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL =
        "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights";
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Models loaded successfully");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
    loadCascade();
  }, []);

  const startWebcam = async () => {
    try {
      setIsWebcamStarted(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setIsWebcamStarted(false);
    }
  };

  const stopWebcam = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setIsWebcamStarted(false);
    setPredictions([]);

    if (detectionIntervalId.current) {
      clearInterval(detectionIntervalId.current);
      detectionIntervalId.current = null;
    }
  };

  const runModel = async () => {
    const net = await cocoSsd.load();
    detectionIntervalId.current = setInterval(() => {
      detect(net);
    }, detectionIntervalMs);
  };

  const loadCascade = async () => {
    try {
      // Fetch the Haar cascade XML files
      const fireResponse = await fetch("/haarcascade_fire.xml");
      const gunResponse = await fetch("/haarcascade_gun.xml");

      if (!fireResponse.ok || !gunResponse.ok) {
        throw new Error("Failed to fetch Haar cascade XML files");
      }

      const fireBuffer = await fireResponse.arrayBuffer();
      const gunBuffer = await gunResponse.arrayBuffer();

      if (!fireBuffer || !gunBuffer) {
        throw new Error("Failed to convert responses to ArrayBuffers");
      }

      cv.FS_createDataFile(
        "/",
        "haarcascade_fire.xml",
        new Uint8Array(fireBuffer),
        true,
        false,
        false
      );
      cv.FS_createDataFile(
        "/",
        "haarcascade_gun.xml",
        new Uint8Array(gunBuffer),
        true,
        false,
        false
      );

      fireClassifier.current = new cv.CascadeClassifier();
      gunClassifier.current = new cv.CascadeClassifier();

      if (!fireClassifier.current.load("/haarcascade_fire.xml")) {
        console.error("Error loading Haar Cascade XML file for fire detection.");
      } else {
        console.log("Haar Cascade loaded successfully for fire detection");
      }

      if (!gunClassifier.current.load("/haarcascade_gun.xml")) {
        console.error("Error loading Haar Cascade XML file for gun detection.");
      } else {
        console.log("Haar Cascade loaded successfully for gun detection");
      }
    } catch (error) {
      console.error("Error loading Haar Cascades:", error);
    }
  };

  useEffect(() => {
    let animationFrameId;
    const runDetection = async () => {
      if (
        videoRef.current &&
        canvasRef.current &&
        labeledDescriptors.length > 0 &&
        modelsLoaded
      ) {
        console.log("Step 1: Starting face detection");

        const options = new faceapi.SsdMobilenetv1Options({
          minConfidence: 0.5,
        });
        const video = videoRef.current;
        const canvas = canvasRef.current;

        console.log("Step 2: Detecting faces in the video feed");

        // Ensure the video is ready
        if (video.readyState < 2) {
          animationFrameId = requestAnimationFrame(runDetection);
          return;
        }

        // Detect faces and obtain descriptors
        const detections = await faceapi
          .detectAllFaces(video, options)
          .withFaceLandmarks()
          .withFaceDescriptors();

        console.log("Step 3: Face detections obtained:", detections);

        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Clear canvas before drawing new detections
        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Draw bounding boxes and landmarks on canvas
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        // Set up face matcher
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        console.log(
          "Step 4: Face matcher initialized with labeled descriptors:",
          labeledDescriptors
        );

        // Label each detection based on descriptors
        resizedDetections.forEach((detection, i) => {
          const result = faceMatcher.findBestMatch(detection.descriptor);
          const box = detection.detection.box;
          const { label, distance } = result;

          // Confidence check and label display
          const confidence = (1 - distance).toFixed(2);
          const labelToDisplay = label === "unknown" ? "Unknown Person" : label;

          console.log(
            `Step 5: Detection ${i + 1}: Label - ${labelToDisplay}, Confidence - ${confidence}`
          );

          // Draw bounding box with label
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: `${labelToDisplay} (${confidence})`,
            boxColor: "green",
          });
          drawBox.draw(canvas);

          // Log result for debugging
          console.log(`Detection ${i + 1} labeled as: ${labelToDisplay}`);
        });
      } else {
        console.log(
          "Skipping detection: Either video, canvas, descriptors, or models are not ready."
        );
      }
      animationFrameId = requestAnimationFrame(runDetection);
    };

    if (isWebcamStarted) {
      console.log("Starting detection loop");
      runDetection();
    }

    return () => {
      console.log("Stopping detection loop");
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [modelsLoaded, labeledDescriptors, isWebcamStarted]);

  const detect = async (net) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 4 || !isWebcamStarted) return;

    // Set video dimensions once
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    video.width = videoWidth;
    video.height = videoHeight;

    // Make object detections
    const obj = await net.detect(video);
    console.log("Detected objects:", obj);

    const context = canvas.getContext("2d");
    if (!context) return;

    const src = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    const gray = new cv.Mat();
    const fires = new cv.RectVector();
    const guns = new cv.RectVector();

    if (fireClassifier.current && gunClassifier.current) {
      const cap = new cv.VideoCapture(video);
      cap.read(src);
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      fireClassifier.current.detectMultiScale(gray, fires, 1.1, 12, 0);
      gunClassifier.current.detectMultiScale(gray, guns, 1.3, 20, 0);

      context.clearRect(0, 0, canvas.width, canvas.height);
      console.log(`${fires.size()} Fires(s) detected`);
      console.log(`${guns.size()} Gun(s) detected`);

      for (let i = 0; i < fires.size(); ++i) {
        const fire = fires.get(i);
        obj.push({
          bbox: [fire.x, fire.y, fire.width, fire.height],
          class: "Fire",
          score: 1,
        });
      }

      for (let i = 0; i < guns.size(); ++i) {
        const gun = guns.get(i);
        obj.push({
          bbox: [gun.x, gun.y, gun.width, gun.height],
          class: "Gun",
          score: 1,
        });
      }
    }

    setPredictions(obj);

    // Resource cleanup
    src.delete();
    gray.delete();
    fires.delete();
    guns.delete();

    // Logging detection data
    const currentTime = Date.now();
    if (currentTime - lastLoggedTime.current >= slowedDetectionIntervalMs) {
      const detections = obj.map((prediction) => ({
        team_id: user?.id || "unknown",
        date_time: new Date().toISOString(),
        category: prediction.class,
        object_confidence: prediction.score,
      }));
      detectionBuffer.current.push(...detections);
      lastLoggedTime.current = currentTime;
    }
  };

  const sendBatchToSupabase = async (batch) => {
    console.log("Sending batch to Supabase:", batch);
    try {
      const { error } = await supabase.from("events").insert(batch);
      if (error) {
        console.error("Error inserting batch to Supabase:", error);
      }
    } catch (err) {
      console.error("Error sending request to Supabase:", err);
    }
  };

  const batchProcess = () => {
    if (detectionBuffer.current.length > 0) {
      sendBatchToSupabase(detectionBuffer.current);
      detectionBuffer.current = []; // Clear buffer after sending
    }
  };

  useEffect(() => {
    if (isWebcamStarted && modelsLoaded) {
      runModel();

      const batchInterval = setInterval(batchProcess, supabasePostReqIntervalMs);

      return () => {
        clearInterval(batchInterval); // Clear batch processing interval
      };
    }
  }, [isWebcamStarted, modelsLoaded]);

  // Handle image upload and create labeled descriptors
  const handleImageUpload = async (event) => {
    console.log("Image uploaded");
    const imageFile = event.target.files?.[0];
    if (imageFile && modelsLoaded) {
      const img = await faceapi.bufferToImage(imageFile);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        const name = prompt("Enter the name of the person:");
        if (name) {
          const newDescriptor = new faceapi.LabeledFaceDescriptors(name, [
            detections.descriptor,
          ]);
          setLabeledDescriptors((prev) => [...prev, newDescriptor]);
          console.log("Labeled descriptor added:", name);
          console.log("Labeled descriptors:", labeledDescriptors);
        } else {
          alert("Name cannot be empty.");
        }
      } else {
        alert("No face detected in the image. Please try another image.");
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="mb-4">
        <button
          onClick={isWebcamStarted ? stopWebcam : startWebcam}
          className={
            isWebcamStarted
              ? "px-4 py-2 rounded-lg text-black hover:bg-blue-500 bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:500%_auto] animate-gradient"
              : "px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
          }
        >
          {isWebcamStarted ? "Stop" : "Start"} SecureGuard
        </button>
      </div>

      <div className="relative">
        {isWebcamStarted ? (
          <div>
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              muted
            />
            {/* Canvas for face detection */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full h-auto">Webcam is off</div>
        )}

        {predictions.length > 0 &&
          predictions.map((prediction, index) => (
            <div key={index}>
              <p
                className="absolute text-xs bg-orange-600 text-white px-2 py-1 rounded-lg"
                style={{
                  left: `${prediction.bbox[0]}px`,
                  top: `${prediction.bbox[1]}px`,
                  width: `${prediction.bbox[2]}px`,
                }}
              >
                {`${prediction.class} - ${Math.round(
                  prediction.score * 100
                )}% confidence`}
              </p>
              <div
                className="absolute border border-black rounded-lg"
                style={{
                  left: `${prediction.bbox[0]}px`,
                  top: `${prediction.bbox[1]}px`,
                  width: `${prediction.bbox[2]}px`,
                  height: `${prediction.bbox[3]}px`,
                }}
              />
            </div>
          ))}
      </div>

      <h3 className="text-xl font-medium mt-6 text-center">
        Upload an Image to Add a Person
      </h3>
      <div className="flex justify-center mt-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default ObjectDetection;
