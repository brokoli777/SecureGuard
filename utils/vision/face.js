import * as faceapi from "face-api.js";

const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights";

// Load face-api models
export const loadFaceApiModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log("Models loaded successfully");
    return true;
  } catch (error) {
    console.error("Error loading face-api models:", error);
    return false;
  }
};

// Detect faces and return results with landmarks and descriptors
export const detectFaces = async (videoRef, canvasRef, labeledDescriptors) => {
  if (videoRef.current && canvasRef.current && labeledDescriptors.length > 0) {
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

    const detections = await faceapi
      .detectAllFaces(videoRef.current, options)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const displaySize = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    };

    faceapi.matchDimensions(canvasRef.current, displaySize);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));

    return { results, resizedDetections };
  }
  return null;
};

// Draw detections and landmarks on the canvas
export const drawDetections = (canvas, detections, results) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

  faceapi.draw.drawDetections(canvas, detections);
  faceapi.draw.drawFaceLandmarks(canvas, detections);

  results.forEach((result, i) => {
    const box = detections[i].detection.box;
    const { label, distance } = result;
    const confidence = (1 - distance).toFixed(2);

    const drawBox = new faceapi.draw.DrawBox(box, {
      label: `${label !== "unknown" ? label : "Unknown"} (${confidence})`,
      boxColor: "green",
    });
    drawBox.draw(canvas);

    console.log(`Detected: ${label}, Confidence: ${confidence}`);
  });
};

// Handle image upload and create labeled descriptors
export const handleImageUpload = async (event, setLabeledDescriptors, modelsLoaded) => {
  const imageFile = event.target.files[0];
  if (imageFile && modelsLoaded) {
    const img = await faceapi.bufferToImage(imageFile);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (detections) {
      const name = prompt("Enter the name of the person:");
      if (name) {
        const newDescriptor = new faceapi.LabeledFaceDescriptors(name, [detections.descriptor]);
        setLabeledDescriptors((prev) => [...prev, newDescriptor]);
        console.log("Labeled descriptor added:", name);
      } else {
        alert("Name cannot be empty.");
      }
    } else {
      alert("No face detected in the image. Please try another image.");
    }
  }
};
