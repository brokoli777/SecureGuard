import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

// Detect objects in the video stream
export const detectObjects = async (videoRef) => {

    // Load the model
    const net = await loadModel();
    
    const video = videoRef.current;

    if (!video || video.readyState < 4) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    video.width = videoWidth;
    video.height = videoHeight;

    // Make object detections
    const obj = await net.detect(video);
    
    console.log("Detected objects:", obj);

    return obj;
};

const loadModel = async () => {
    const net = await cocoSsd.load();
    return net;
}
