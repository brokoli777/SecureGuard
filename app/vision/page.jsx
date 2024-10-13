"use client";

import { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { createClient } from "@/utils/supabase/client";
import { detectFaces, drawDetections, handleImageUpload, loadFaceApiModels } from "@/utils/vision/face";

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
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getUser();
  }, [supabase]);

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
      const result = await detectFaces(videoRef, canvasRef, labeledDescriptors);
      if (result) {
        const { results, resizedDetections } = result;
        drawDetections(canvasRef.current, resizedDetections, results);
      }
      animationFrameId = requestAnimationFrame(runDetection);
    };

    if (modelsLoaded && labeledDescriptors.length > 0) {
      runDetection();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [modelsLoaded, labeledDescriptors]);


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

  useEffect(() => {
    const loadModels = async () => {
      const success = await loadFaceApiModels();
      setModelsLoaded(success);
    };
    loadModels();
  }, []);
  

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
            className="w-full h-auto rounded"
            autoPlay
            muted
            width="640"
            height="480"
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
          onChange={(event) =>
            handleImageUpload(event, setLabeledDescriptors, modelsLoaded)
          }
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default ObjectDetection;
