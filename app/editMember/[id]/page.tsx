"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function EditMemberForm() {
  const { id } = useParams(); // Extract member ID from the dynamic route
  const router = useRouter(); // Use router for redirect after update
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    notes: "",
  });


  // Fetch member data on component mount
  useEffect(() => {
    if (!id) {
      console.error("Member ID is missing. Cannot fetch data.");
      return;
    }

    const fetchMember = async () => {
      console.log("Fetching member data for member ID:", id);

      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", id) 
        .single();

      if (error) {
        console.error("Error fetching member data:", error);
        return;
      }

      console.log("Member data fetched successfully:", data);

      setFormData({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        phoneNumber: data.phone_number || "",
        streetAddress: data.street_address || "",
        city: data.city || "",
        notes: data.notes || "",
      });

      setImage(data.photo_url || ""); // Fetch photo URL if exists
      setLoading(false);;
    };

    fetchMember();
  }, [id]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle photo upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      //  upload the image to a storage service
      // and save the URL in your database.
    }
  };

  const handleRemoveImage = () => {
    setImage(null); // Remove image
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Check form data before submission
    console.log("Submitting updated form data:", formData);

    try {
      const { error } = await supabase
        .from("members")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phoneNumber, // Updated fields
          street_address: formData.streetAddress,
          city: formData.city,
          notes: formData.notes,
          //photo_url: image, // Update the photo URL in the database
        })
        .eq("member_id", id); 

      if (error) {
        console.error("Error updating member:", error);
      } else {
        console.log("Member updated successfully");
        router.push("/memberList"); // Redirect to member list after successful update
      }
    } catch (err) {
      console.error("Error updating member:", err);
    }
  };

  // Handle delete member
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("member_id", id); // Ensure you're deleting by 'member_id'

      if (error) {
        console.error("Error deleting member:", error);
      } else {
        console.log("Member deleted successfully");
        router.push("/memberList"); // Redirect to member list after successful deletion
      }
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  // Handle cancel action (redirect back)
  const handleCancel = () => {
    router.push("/memberList"); // Redirect to member list
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Member Form</h1>

      {loading ? (
        <p>Loading member data...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
          {/* Left side: Image Upload */}
          <div className="flex flex-col relative">
            {image ? (
              <div className="relative w-48 h-48">
                <img
                  src={image}
                  alt="Uploaded user"
                  className="w-full h-full object-cover mb-4"
                />
                {/* Remove button on the image (top-right corner) */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
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
            {/* Custom file input label */}
            <label
              htmlFor="imageUpload"
              className="mt-2 w-36 cursor-pointer bg-blue-500 text-white p-2 text-center rounded"
            >
              Browse...
            </label>
            <Input
              type="file"
              id="imageUpload"
              onChange={handleImageUpload}
              className="hidden"
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
                className={`w-2/3 ${errors.lastName ? "border-red-500" : ""}`}
                required
              />
            </div>

            <div className="flex gap-4">
              <label className="w-1/3">Email:</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-2/3 ${errors.email ? "border-red-500" : ""}`}
                required
              />
            </div>

            <div className="flex gap-4">
              <label className="w-1/3">Phone Number:</label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`w-2/3 ${errors.phoneNumber ? "border-red-500" : ""}`}
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

          {/* Buttons: Delete on the left, Update and Cancel on the right */}
          <div className="col-span-2 flex justify-between mt-4">
            <Button variant="destructive" onClick={handleDelete}>
                Delete Member
              </Button>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" className="mr-auto">
              Update Member
            </Button>
            
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
