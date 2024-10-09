"use client";

import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import Webcam from "react-webcam";

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  // const [detectionInterval, setDetectionInterval] = useState();

  const startWebcam = async () => {
    try {
      setIsWebcamStarted(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setIsWebcamStarted(false);
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = () => {
    const video = videoRef.current;
    if (video) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
      setIsWebcamStarted(false);
      setPredictions([]);
    }
  };

  //Testing option

  const runPrediction = async () => {
    const model = await cocoSsd.load();
    setInterval(() => {
      predictObject(model);
    }, 10);
  };


  const predictObject = async (model) => {
    model.detect(videoRef.current).then((predictions) => {
      setPredictions(predictions);
    }).catch((err) => console.error(err));
  };


//Working option
  const runModel = async () => {
    const net = await cocoSsd.load();
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
      const video = videoRef.current.video;

      const videoWidth = videoRef.current.video.videoWidth;
      const videoHeight = videoRef.current.video.videoHeight;

      // Set video width (causes warning if not set)
      videoRef.current.video.width = videoWidth;
      videoRef.current.video.height = videoHeight;

      // Make Detections
        const obj = await net.detect(video);
        setPredictions(obj);
      
  };



  useEffect(() => {
    if (isWebcamStarted) {
      // setDetectionInterval(setInterval(predictObject, 600));
      runModel();
      //runPrediction();
    } 
    // else {
    //   if (detectionInterval) {
    //     clearInterval(detectionInterval);
    //     setDetectionInterval(null);
    //   }
    // }
  }, [isWebcamStarted]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="mb-4">
        <button
          onClick={isWebcamStarted ? stopWebcam : startWebcam}
          className={isWebcamStarted 
            ? "px-4 py-2 rounded-lg text-black hover:bg-blue-500 bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:500%_auto] animate-gradient"
            : "px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
          }
        >
          {isWebcamStarted ? 'Stop' : 'Start'} SecureGuard
        </button>
      </div>
      <div className="relative">
        {isWebcamStarted ? (
           //<video ref={videoRef} className="w-full h-auto rounded" autoPlay muted />
          <Webcam
            ref={videoRef}
            audio={false}
            videoConstraints={{ facingMode: 'user' }}
            className="w-full h-auto rounded"
          />
        ) : (
          <div className="w-full h-auto ">Webcam is off</div>
        )}

        {predictions.length > 0 && (
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
                //className='absolute border border-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:500%_auto] animate-gradient'
                style={{
                  left: `${prediction.bbox[0]}px`,
                  top: `${prediction.bbox[1]}px`,
                  width: `${prediction.bbox[2]}px`,
                  height: `${prediction.bbox[3]}px`,
                }}
              />
            </div>
          ))
        )}
      </div>

      {predictions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Predictions:</h3>
          <ul className="list-disc ml-5">
            {predictions.map((prediction, index) => (
              <li key={index}>
                {`${prediction.class} (${(prediction.score * 100).toFixed(2)}%)`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
