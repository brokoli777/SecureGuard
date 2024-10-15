"use client";

import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { createClient } from "@/utils/supabase/client";
import "@tensorflow/tfjs";
import * as faceapi from "face-api.js";


const ObjectDetection = () => {
  const videoRef = useRef(null);
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [user, setUser] = useState(null);

  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);

  const supabase = createClient();
  const detectionBuffer = useRef([]);
  const detectionIntervalId = useRef(null); 
  const lastLoggedTime = useRef(0);

  const detectionIntervalMs = 10; 
  const slowedDetectionIntervalMs = 500;
  const supabasePostReqIntervalMs = 2000;

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        console.log(user.id);

        //Uncomment once descriptor are uploaded in members table
        // if (user) {
        //   const { data: membersData, error } = await supabase
        //     .from('members')
        //     .select('descriptor')
        //     .eq('team_id', user.id);
  
        //   if (error) {
        //     console.error("Error fetching descriptors:", error);
        //   } else {
        //     const labeledDescriptorsList = membersData.map(descriptor => 
        //       new faceapi.LabeledFaceDescriptors(descriptor.name, [Float32Array.from(descriptor.descriptor)])
        //     );
            
        //     setLabeledDescriptors(labeledDescriptorsList);
        //     console.log("Labeled Descriptors from database:", labeledDescriptorsList);
        //   }
        // }
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

  useEffect(() => {
    let animationFrameId;
    const runDetection = async () => {
      if (
        videoRef.current &&
        canvasRef.current &&
        labeledDescriptors.length > 0
      ) {
        const options = new faceapi.SsdMobilenetv1Options({
          minConfidence: 0.5,
        });
        const video = videoRef.current;
        const canvas = canvasRef.current;

        console.log("labeledDescriptors", labeledDescriptors);

        const detections = await faceapi
          .detectAllFaces(video, options)
          .withFaceLandmarks()
          .withFaceDescriptors();

        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        // Clear canvas before drawing new detections
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        // Draw bounding boxes and landmarks on canvas
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        console.log("labelDescriptors again....", labeledDescriptors);

        // Match detections with known descriptors
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const results = resizedDetections.map((d) =>
          faceMatcher.findBestMatch(d.descriptor)
        );

        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const { label, distance } = result;
          const confidence = (1 - distance).toFixed(2);

          // Draw the box with the name and confidence inside
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: `${label !== "unknown" ? label : "Unknown"} (${confidence})`,
            boxColor: "green",
          });
          drawBox.draw(canvas);

          // Log to the console with probability and name
          console.log(
            `Detected: ${
              label !== "unknown" ? label : "Unknown"
            }, Confidence: ${confidence}`
          );
        });
      }
      animationFrameId = requestAnimationFrame(runDetection);
    };


    if (modelsLoaded && labeledDescriptors.length > 0 && isWebcamStarted) {
      runDetection();
      console.log("Running detection");
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [modelsLoaded, labeledDescriptors, isWebcamStarted]);


  const detect = async (net) => {
    const video = videoRef.current;

    if (!video || video.readyState < 4 || !isWebcamStarted) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    video.width = videoWidth;
    video.height = videoHeight;

    // Make object detections
    const obj = await net.detect(video);
    setPredictions(obj);

    console.log("Detected objects:", obj);

    const currentTime = Date.now();
    if (currentTime - lastLoggedTime.current >= slowedDetectionIntervalMs) {
      detectionBuffer.current.push(
        ...obj.map((prediction) => ({
          team_id: user?.id || "unknown",
          date_time: new Date().toISOString(),
          category: prediction.class,
          object_confidence: prediction.score,
        }))
      );
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
  }, [isWebcamStarted]);

  // Handle image upload and create labeled descriptors
  const handleImageUpload = async (event) => {
    console.log("Image uploaded");
    const imageFile = event.target.files[0];
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
            // className="w-full h-auto rounded"
            className="w-full h-full object-cover rounded-lg"
            autoPlay
            muted
            // width="640"
            // height="480"
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
                  width: `${prediction.bbox[2] - 100}px`,
                }}
              >
                {`${prediction.class} - ${Math.round(prediction.score * 100)}% confidence`}
              </p>
              <div
                className="absolute border border-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-lg"
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
