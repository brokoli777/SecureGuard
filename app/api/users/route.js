import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Handle GET request (fetch current user details)
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
    // Fetch user profile by user ID
    const { data: profile, error } = await supabase
      .from("profiles") // Ensure your profiles table matches
      .select("*")
      .eq("id", user.id) // Query by user ID
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Return user profile details
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("Server error while fetching user profile:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Handle PUT request (update user profile)
export async function PUT(req) {
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

  let body;
  try {
    body = await req.json();
    console.log("Incoming request body:", body);
  } catch (err) {
    console.error("Error parsing JSON body:", err);
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { first_name, last_name, team_name } = body; // Extract fields from body

  // Validate incoming data
  if (!first_name || !last_name || !team_name) {
    return NextResponse.json(
      { success: false, message: "Missing fields" },
      { status: 400 }
    );
  }

  try {
    // Update user profile by user ID
    const { data, error } = await supabase
      .from("profiles") // Ensure your profiles table matches
      .update({
        first_name: first_name,
        last_name: last_name,
        team_name: team_name,
      })
      .eq("id", user.id); // Update by user ID

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    console.log("User profile updated successfully:", data);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (err) {
    console.error("Server error while updating profile:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
