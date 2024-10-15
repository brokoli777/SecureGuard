"use client";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);

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

  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing webcam:", err));
    } else {
      console.error("getUserMedia not supported in this browser.");
    }
  };

  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);

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

    if (modelsLoaded && labeledDescriptors.length > 0) {
      runDetection();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [modelsLoaded, labeledDescriptors]);

  // Handle image upload and create labeled descriptors
  const handleImageUpload = async (event) => {
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

          //TODO: Add Descriptor to supabase
        } else {
          alert("Name cannot be empty.");
        }
      } else {
        alert("No face detected in the image. Please try another image.");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Face Recognition
      </h2>
      {/* Webcam stream */}
      <div className="relative w-[460px] h-[300px] mx-auto">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
        />
        {/* Canvas for face detection */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
        />
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

export default FaceRecognition;
