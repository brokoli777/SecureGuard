"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import EventTable from "@/components/EventTable"; // Assuming you have an EventTable component

const supabase = createClient();

export default function MemberDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);

  // Fetch member details by member_id
  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", id)
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

  // Fetch event logs associated with the member
  useEffect(() => {
    const fetchEventLogs = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("member_id", id); // Adjust this if the logs are associated by a different field, like team_id

      if (error) {
        console.error("Error fetching event logs:", error);
      } else {
        setEventLogs(data);
      }
    };

    fetchEventLogs();
  }, [id]);

  if (loading) {
    return <p>Loading member data...</p>;
  }

  // Create full name
  const fullName = `${memberData.first_name || "N/A"} ${memberData.last_name || "N/A"}`;

  return (
    <div className="container mx-auto p-6">
      {/* Main Card Layout */}
      <div className="flex justify-center">
        <div className="p-6 rounded-lg shadow-lg w-full max-w-4xl flex">
          
          {/* Left side: Profile Image and Log History Button */}
          <div className="w-1/3 flex flex-col justify-center items-center">
            {memberData.photo_url ? (
              <img
                src={memberData.photo_url}
                alt="Member Image"
                className="w-40 h-40 object-cover mb-4 rounded-full"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-200 flex items-center justify-center mb-4 rounded-full">
                No Image
              </div>
            )}
            {/* Activity Log Button below the profile image */}
            <Button
              variant="outline"
              onClick={() => router.push(`/logHistory/${id}`)}
              className="mt-4"
            >
              View Log History
            </Button>
          </div>

          {/* Right side: Member Info */}
          <div className="w-2/3 pl-8 flex flex-col">
            
            {/* Member Name and Edit Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-semibold">{fullName}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/editMember/${id}`)}
              >
                ✏️ Edit
              </Button>
            </div>

            {/* Team ID */}
            <div className="text-gray-500 mb-4">
              <p>Team ID: {memberData.team_id || "N/A"}</p>
            </div>

            {/* Divider Line */}
            <hr className="mb-4" />

            {/* Contact and Location Information */}
            <div className="space-y-2">
              <p><strong>Email:</strong> {memberData.email || "N/A"}</p>
              <p><strong>Phone:</strong> {memberData.phone_number || "N/A"}</p>
              <p><strong>Street Address:</strong> {memberData.street_address || "N/A"}</p>
              <p><strong>City:</strong> {memberData.city || "N/A"}</p>
              <p><strong>Notes:</strong> {memberData.notes || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Logs Table */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Event Logs for {fullName}</h3>
        {eventLogs.length > 0 ? (
          <EventTable data={eventLogs} hideMemberColumn={true} />
          // Display the event logs using EventTable component
        ) : (
          <p>No event logs found for this member.</p>
        )}
      </div>
    </div>
  );
}
