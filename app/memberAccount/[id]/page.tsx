"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function MemberDetailsPage() {
  const { id } = useParams(); // Get the member ID from the URL
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);

  // Fetch member details by member_id
  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", id) // Query by member_id from the URL
        .single();

      if (error) {
        console.error("Error fetching member data:", error);
      } else {
        setMemberData(data);
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [id]);

  if (loading) {
    return <p>Loading member data...</p>;
  }

  // Create full name
  const fullName = `${memberData.first_name || "N/A"} ${memberData.last_name || "N/A"}`;

  return (
    <div className="container mx-auto p-6">
      {/* Display the full name as the title */}
      <h1 className="text-2xl font-bold mb-4">{fullName}</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Left side: Member Image */}
        <div className="flex flex-col items-center">
          {memberData.photo_url ? (
            <img
              src={memberData.photo_url}
              alt="Member Image"
              className="w-48 h-48 object-cover mb-4 rounded-full"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mb-4 rounded-full">
              No Image
            </div>
          )}
        </div>

        {/* Right side: Member Information */}
        <div className="col-span-2 flex flex-col space-y-4 p-4 rounded-md shadow-md">
          <div className="flex gap-4">
            <label className="font-semibold w-1/3">Phone Number:</label>
            <div className="w-2/3">{memberData.phone_number || "N/A"}</div>
          </div>

          <div className="flex gap-4">
            <label className="font-semibold w-1/3">Email:</label>
            <div className="w-2/3">{memberData.email || "N/A"}</div>
          </div>

          <div className="flex gap-4">
            <label className="font-semibold w-1/3">Street Address:</label>
            <div className="w-2/3">{memberData.street_address || "N/A"}</div>
          </div>

          <div className="flex gap-4">
            <label className="font-semibold w-1/3">City:</label>
            <div className="w-2/3">{memberData.city || "N/A"}</div>
          </div>

          <div className="flex gap-4">
            <label className="font-semibold w-1/3">Team ID:</label>
            <div className="w-2/3">{memberData.team_id || "N/A"}</div>
          </div>

          <div className="flex gap-4">
            <label className="font-semibold w-1/3">Notes:</label>
            <div className="w-2/3">{memberData.notes || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Buttons stacked on the left side */}
      <div className="flex flex-col items-start mt-6 space-y-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/editMember/${id}`)}
        >
          Edit Member
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/logHistory/${id}`)} // Navigate to log history page
        >
          View Log History
        </Button>
      </div>
    </div>
  );
}
