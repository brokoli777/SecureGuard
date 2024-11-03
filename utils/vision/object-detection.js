// import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import "@tensorflow/tfjs";
// import cv from "opencv.js";

// // Detect objects in the video stream
// export const detectObjects = async (videoRef) => {

//     // Load the model
//     const net = await loadModel();
    
//     const video = videoRef.current;

//     if (!video || video.readyState < 4) return;

//     const videoWidth = video.videoWidth;
//     const videoHeight = video.videoHeight;

//     video.width = videoWidth;
//     video.height = videoHeight;

//     // Make object detections
//     const obj = await net.detect(video);
    
//     console.log("Detected objects:", obj);

//     return obj;
// };

// const loadModel = async () => {
//     const net = await cocoSsd.load();
//     return net;
// }

// export function createFileFromBase64(path, base64Data) {
//     let binaryString = atob(base64Data);
//     let data = new Uint8Array(binaryString.length);
//     for (let i = 0; i < binaryString.length; i++) {
//         data[i] = binaryString.charCodeAt(i);
//     }
//     cv.FS_createDataFile('/', path, data, true, false, false);
// }

// export const createFileFromUrl = async function(path, url) {
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`Failed to load ${url}, status: ${response.status}`);
//         }
//         const data = new Uint8Array(await response.arrayBuffer());
//         cv.FS_unlink(path);
//         cv.FS_createDataFile('/', path, data, true, false, false);
//     } catch (error) {
//         console.error(error);
//     }
// };
