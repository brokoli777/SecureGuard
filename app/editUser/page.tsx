"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Ensure this is the client-side client

const supabase = createClient();

export default function EditUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    teamName: "",
  });
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false); // State for the popup

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data.");
        return;
      }

      const user = data.user;
      if (user) {
        setUserId(user.id); // Set user ID
        // Fetch additional profile information if needed
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, team_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Failed to fetch profile data.");
          return;
        }

        setFormData({
          firstName: profile.first_name,
          lastName: profile.last_name,
          teamName: profile.team_name,
        });
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          team_name: formData.teamName,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.message || "Failed to update profile.");
      } else {
        console.log("Profile updated successfully");
        setShowPopup(true); // Show success popup
        setTimeout(() => {
          setShowPopup(false); // Hide popup after 3 seconds
          router.push("/protected"); // Redirect after successful update
        }, 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating the profile.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      
      {showPopup && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-green-500 font-bold">Profile updated successfully!</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">User ID: {userId}</h3>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="firstName">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="lastName">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="teamName">
            Team Name
          </label>
          <input
            type="text"
            id="teamName"
            value={formData.teamName}
            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Update Profile
        </button>
      </form>
    </div>
  );
}
