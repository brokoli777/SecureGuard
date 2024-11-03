"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";

const MODEL_URL =
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights";
const supabase = createClient();

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  notes: string;
}

const formFields = [
  { label: "First Name", name: "firstName", type: "text", required: true },
  { label: "Last Name", name: "lastName", type: "text", required: true },
  {
    label: "Email",
    name: "email",
    type: "email",
    required: true,
    validate: (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format",
  },
  {
    label: "Phone Number",
    name: "phoneNumber",
    type: "tel",
    maxLength: 10,
    validate: (value: string) =>
      value.length === 10 || value.length === 0
        ? ""
        : "Phone number must be exactly 10 digits",
  },
  { label: "Street Address", name: "streetAddress", type: "text" },
  { label: "City", name: "city", type: "text" },
];

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  streetAddress: "",
  city: "",
  notes: "",
};

export default function EditMemberForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams() as { id: string };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [image, setImage] = useState({
    file: null as File | null,
    preview: null as string | null,
    uploadSuccess: false,
  });
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const validateField = (name: string, value: string) => {
    const field = formFields.find((f) => f.name === name);
    if (!field) return "";
    if (field.required && !value.trim()) return `${field.label} is required`;
    return field.validate ? field.validate(value) : "";
  };

  const isFormValid = () => {
    const requiredFieldsValid = formFields
      .filter((field) => field.required)
      .every((field) => {
        const value = formData[field.name as keyof FormData];
        return value.trim() !== "" && !validateField(field.name, value);
      });
    const hasNoErrors = Object.values(errors).every((error) => !error);
    return requiredFieldsValid && hasNoErrors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phoneNumber" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const processImage = async (file: File) => {
    const img = await faceapi.bufferToImage(file);
    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
    );

    if (detections.length !== 1) {
      throw new Error(
        detections.length === 0
          ? "No face detected. Please upload a clear photo."
          : "Multiple faces detected. Please upload a photo with only one face."
      );
    }

    const fullDetection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!fullDetection) throw new Error("Unable to process facial features.");
    return fullDetection.descriptor;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modelsLoaded) return;

    setIsProcessing(true);
    setImage({
      file,
      preview: URL.createObjectURL(file),
      uploadSuccess: false,
    });

    try {
      const descriptor = await processImage(file);
      setFaceDescriptor(descriptor);
      setImage((prev) => ({ ...prev, uploadSuccess: true }));
      setErrors((prev) => ({ ...prev, face: "" }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error processing image";
      handleRemoveImage();
      setErrors((prev) => ({ ...prev, face: errorMessage }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    if (image.preview) URL.revokeObjectURL(image.preview);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImage({ file: null, preview: null, uploadSuccess: false });
    setFaceDescriptor(null);
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authError) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });
      if (image.file) formDataToSend.append("image", image.file);
      if (faceDescriptor) {
        formDataToSend.append(
          "descriptor",
          JSON.stringify(Array.from(faceDescriptor))
        );
      }

      const response = await fetch(`/api/members/${id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      if (!response.ok) throw new Error("Failed to update member");

      router.push("/memberList");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit:
          error instanceof Error ? error.message : "Error updating member",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      authError ||
      !window.confirm("Are you sure you want to delete this member?")
    )
      return;
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("member_id", id);
      if (error) throw error;
      router.push("/memberList");
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded) return;
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, [modelsLoaded]);

  useEffect(() => {
    async function fetchMember() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Authentication error");

        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("member_id", id)
          .single();

        if (error) throw error;
        if (data.team_id !== user.id) throw new Error("Not authorized");

        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phoneNumber: data.phone_number || "",
          streetAddress: data.street_address || "",
          city: data.city || "",
          notes: data.notes || "",
        });
        setImage((prev) => ({ ...prev, preview: data.photo_url || null }));
        setLoading(false);
      } catch (error) {
        setAuthError("You are not authorized to edit this member.");
        setLoading(false);
      }
    }

    if (id) fetchMember();
  }, [id]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl text-center font-bold mb-2">Edit Member Form</h1>
      <p className="text-center text-gray-500 mb-10">
        Update member details or delete the member.
      </p>

      {loading ? (
        <p className="text-center text-gray-500">Loading member data...</p>
      ) : authError ? (
        <div className="text-red-500 text-center font-semibold">
          {authError}
        </div>
      ) : (
        <>
          {Object.values(errors).some(Boolean) && (
            <div className="flex flex-wrap gap-2 mb-10">
              {Object.entries(errors).map(
                ([field, error]) =>
                  error && (
                    <li
                      key={field}
                      className="bg-gradient-to-b from-pink-400 to-red-500 text-white px-6 py-1 rounded-full text-sm font-semibold list-none shadow-md">
                      {error}
                    </li>
                  )
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
            <div className="flex flex-col relative">
              {image.preview ? (
                <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt={isProcessing ? "" : "Member photo"}
                    className={`w-full h-full object-cover ${
                      isProcessing ? "opacity-50" : ""
                    }`}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
                      <p className="mt-2 ml-4 text-white text-md font-medium">
                        Processing image...
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10 transition-transform transform hover:scale-110"
                    aria-label="Remove Image">
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className={`w-64 h-64 bg-gray-200 flex flex-col items-center justify-center text-gray-500 border rounded-lg p-4 ${
                    errors.face ? "border-red-500" : ""
                  }`}>
                  <span className="text-lg font-medium mb-3">Requirements</span>
                  <ul className="text-md list-decimal text-left pl-4 space-y-1">
                    <li>One person only</li>
                    <li>Front-facing view</li>
                    <li>Good lighting</li>
                    <li>Clear, unblurred image</li>
                  </ul>
                </div>
              )}
              {image.uploadSuccess && (
                <div className="flex items-center mt-2">
                  <div className="w-64 bg-gradient-to-b from-green-500 to-green-600 text-white py-1 rounded-full text-sm font-medium flex items-center justify-center shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Image meets all requirements
                  </div>
                </div>
              )}
              <Button
                variant="default"
                asChild
                className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white mt-4 rounded-md shadow-md transition-all duration-200">
                <label htmlFor="imageUpload">Upload Image</label>
              </Button>
              <Input
                type="file"
                id="imageUpload"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                disabled={isProcessing}
              />
            </div>

            <div className="flex flex-col space-y-4">
              {formFields.map(({ label, name, type, required }) => (
                <div key={name} className="flex gap-4">
                  <label className="w-1/3">{label}:</label>
                  <Input
                    type={type}
                    name={name}
                    value={formData[name as keyof FormData]}
                    onChange={handleInputChange}
                    className={`w-2/3 ${errors[name] ? "border-red-500" : ""}`}
                    required={required}
                  />
                </div>
              ))}
              <div className="flex gap-4">
                <label className="w-1/3">Notes:</label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-2/3 resize-none"
                />
              </div>
            </div>

            <div className="col-span-2 flex justify-between mt-4">
              <Button
                variant="destructive"
                onClick={handleDelete}
                type="button"
                className="w-64 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-700 hover:to-red-800 text-white rounded-md shadow-md transition-all duration-200"
                disabled={isSubmitting}>
                Delete Member
              </Button>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/memberList")}
                  type="button"
                  className="w-32"
                  disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-32"
                  disabled={isSubmitting || isProcessing || !isFormValid()}>
                  {isSubmitting ? "Updating..." : "Update Member"}
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
