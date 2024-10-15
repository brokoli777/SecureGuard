"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // Import the router for redirection
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NewMemberForm() {
  const router = useRouter(); // Initialize the router
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    streetAddress: "",
    city: "",
    notes: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });

  // Handle input change for all form fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle input validation on blur for specific fields
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validate first and last name
    if (name === "firstName" || name === "lastName") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: value
          ? ""
          : `${name === "firstName" ? "First" : "Last"} name is required`,
      }));
    }

    // Validate email format
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: emailRegex.test(value) ? "" : "Invalid email format",
      }));
    }

    // Validate phone number length
    if (name === "phoneNumber") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber:
          value.length === 10 ? "" : "Phone number must be exactly 10 digits",
      }));
    }
  };

  // Handle phone number input change (digits only)
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setFormData((prevData) => ({
        ...prevData,
        phoneNumber: value,
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove the uploaded image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ["firstName", "lastName", "phoneNumber", "email"];
    let formIsValid = true;

    // Check if required fields are filled
    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: `${field.replace(/([A-Z])/g, " $1")} is required`,
        }));
        formIsValid = false;
      }
    });

    // If form is valid, send data to the server
    if (formIsValid && !errors.email && !errors.phoneNumber) {
      try {
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });
        if (image) {
          formDataToSend.append("image", image);
        }

        const response = await fetch("/api/members", {
          method: "POST",
          body: formDataToSend,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Member added successfully:", data);
          router.push("/memberList");
        } else {
          const errorData = await response.json();
          console.error("Error adding member:", errorData);
        }
      } catch (error) {
        console.error("Error adding member:", error);
      }
    } else {
      console.log("Form contains errors.");
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    router.push("/memberList"); // Redirect to the member list page
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Member Form</h1>

      {/* Display error messages */}
      <div className="mb-4">
        {Object.values(errors).some((error) => error) && (
          <div className="text-red-500 text-sm">
            <ul>
              {Object.keys(errors).map(
                (field) =>
                  errors[field as keyof typeof errors] && (
                    <li key={field}>{errors[field as keyof typeof errors]}</li>
                  )
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Form for adding a new member */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
        {/* Left side: Image Upload */}
        <div className="flex flex-col relative">
          {imagePreview ? (
            <div className="relative w-48 h-48">
              <img
                src={imagePreview}
                alt="Uploaded user"
                className="w-full h-full object-cover mb-4"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                ✕
              </button>
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 mb-4">
              No Image
            </div>
          )}
          <label htmlFor="imageUpload" className="text-left">
            Upload User Image
          </label>
          <label
            htmlFor="imageUpload"
            className="mt-2 w-36 cursor-pointer bg-blue-500 text-white p-2 text-center rounded">
            Browse...
          </label>
          <Input
            type="file"
            id="imageUpload"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* Right side: Form Inputs */}
        <div className="flex flex-col space-y-4">
          <div className="flex gap-4">
            <label className="w-1/3">First Name:</label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-2/3 ${errors.firstName ? "border-red-500" : ""}`}
              required
            />
          </div>

          <div className="flex gap-4">
            <label className="w-1/3">Last Name:</label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-2/3 ${errors.lastName ? "border-red-500" : ""}`}
              required
            />
          </div>

          <div className="flex gap-4">
            <label className="w-1/3">Phone Number:</label>
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handlePhoneNumberChange}
              onBlur={handleBlur}
              maxLength={10}
              className={`w-2/3 ${errors.phoneNumber ? "border-red-500" : ""}`}
            />
          </div>

          <div className="flex gap-4">
            <label className="w-1/3">Email:</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-2/3 ${errors.email ? "border-red-500" : ""}`}
            />
          </div>

          <div className="flex gap-4">
            <label className="w-1/3">Street Address:</label>
            <Input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              className="w-2/3"
            />
          </div>

          <div className="flex gap-4">
            <label className="w-1/3">City:</label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-2/3"
            />
          </div>

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

        {/* Buttons: Add Member and Cancel */}
        <div className="col-span-2 flex justify-end mt-4 gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Member</Button>
        </div>
      </form>
    </div>
  );
}
