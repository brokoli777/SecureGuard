import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Handle GET request (fetch events for the current user)
export async function GET(req) {
  const supabase = createClient();

  // Get user session
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();
  if (sessionError || !user) {
    return NextResponse.json(
      { success: false, message: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Fetch events where team_id matches the current user's ID
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("team_id", user.id); // Filter by current user's ID

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Return the events
    return NextResponse.json({ success: true, events });
  } catch (err) {
    console.error("Server error while fetching events:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
