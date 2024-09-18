"use client";

import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const ObjectDetection = () => {
  const [model, setModel] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [detections, setDetections] = useState([]);
  const [useWebcam, setUseWebcam] = useState(false);
  const imageRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setUseWebcam(false);
    setDetections([]);
  };

  const handleObjectDetection = async () => {
    if (model && imageRef.current) {
      const predictions = await model.detect(imageRef.current);
      setDetections(predictions);
    }
  };

  const startWebcam = async () => {
    if (navigator.mediaDevices.getUserMedia) {
      setUseWebcam(true);
      setImageURL(null);
      setDetections([]);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } else {
      alert("Webcam not supported in this browser.");
    }
  };

  const captureWebcamFrame = async () => {
    if (videoRef.current && canvasRef.current && model) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const imageData = canvasRef.current;
      const predictions = await model.detect(imageData);
      setDetections(predictions);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Object Detection</h1>
      <p className="mb-4">
        Upload an image or use your webcam to detect objects.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
      <button
        onClick={triggerFileInput}
        className="mb-4 px-4 py-2 mr-2 bg-blue-500 text-white rounded-lg">
        Browse
      </button>

      <button
        onClick={startWebcam}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
        Start Webcam
      </button>

      {useWebcam && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            className="rounded-lg"
            style={{
              width: "640px",
              height: "480px",
              border: "2px solid black",
            }}></video>
          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
            width={640}
            height={480}></canvas>
          <button
            onClick={captureWebcamFrame}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg">
            Detect Objects in Webcam Frame
          </button>
        </div>
      )}

      {imageURL && (
        <div>
          <img
            src={imageURL}
            alt="Upload Preview"
            ref={imageRef}
            onLoad={handleObjectDetection}
            className="rounded-lg max-h-[250px] max-w-[250px]"
          />
        </div>
      )}

      <div>
        <h3 className="text-2xl font-semibold mt-4">Detected Objects:</h3>
        {detections.length > 0 ? (
          detections.map((item, index) => (
            <div key={index}>
              <strong>{item.class}</strong> - {Math.round(item.score * 100)}%
            </div>
          ))
        ) : (
          <p>No objects detected yet.</p>
        )}
      </div>
    </div>
  );
};

export default ObjectDetection;
