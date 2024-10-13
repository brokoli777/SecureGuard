"use client";

import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { createClient } from "@/utils/supabase/client";

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [user, setUser] = useState(null);

  const supabase = createClient();
  const detectionBuffer = useRef([]);
  const detectionIntervalId = useRef(null); // Store the interval ID
  const lastLoggedTime = useRef(0);

  const detectionIntervalMs = 10; // Adjust detection speed here
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

    // Clear the detection interval if it stops running
    if (detectionIntervalId.current) {
      clearInterval(detectionIntervalId.current);
      detectionIntervalId.current = null;
    }
  };

  const runModel = async () => {
    const net = await cocoSsd.load();

    // Start a detection loop with the specified interval
    detectionIntervalId.current = setInterval(() => {
      detect(net);
    }, detectionIntervalMs);
  };

  const detect = async (net) => {
    const video = videoRef.current;

    // Check if the video element is ready and webcam is started
    if (!video || video.readyState < 4 || !isWebcamStarted) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    video.width = videoWidth;
    video.height = videoHeight;

    // Make object detections
    const obj = await net.detect(video);
    setPredictions(obj);

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
    if (isWebcamStarted) {
      runModel(); // Start the detection process
  
      const batchInterval = setInterval(batchProcess, supabasePostReqIntervalMs);
  
      // Cleanup function only clears intervals, doesn't call stopWebcam()
      return () => {
        clearInterval(batchInterval); // Clear batch processing interval
        // if (detectionIntervalId.current) {
        //   clearInterval(detectionIntervalId.current); // Clear detection interval
        //   detectionIntervalId.current = null;
        // }
      };
    }
  }, [isWebcamStarted]);
  

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
          <video
            ref={videoRef}
            className="w-full h-auto rounded"
            autoPlay
            muted
            width="640"
            height="480"
          />
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
    </div>
  );
};

export default ObjectDetection;
