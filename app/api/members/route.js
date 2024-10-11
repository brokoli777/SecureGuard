// app/api/members/route.js
import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server"; // Server-side client for API routes

// Handle POST request (insert a new member)
export async function POST(req) {
  const supabase = createClient(); // Use your server-side client here
  const { firstName, lastName, email, phoneNumber, streetAddress, city, notes } = await req.json(); // Include new fields

  // Use supabase.auth.getUser() to securely authenticate the user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ success: false, message: "Failed to authenticate user" }, { status: 401 });
  }

  const userId = userData.user.id; // Securely fetched user ID
  console.log("Authenticated User ID (team_id):", userId);

  // Check if the userId exists in the `profiles` table (or whatever table team_id is referencing)
  const { data: profile, error: profileError } = await supabase
    .from('profiles') // `profiles` is the table that `team_id` references
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // 'PGRST116' means no data found
    console.error('Profile check error:', profileError);
    return NextResponse.json({ success: false, message: profileError.message }, { status: 500 });
  }

  if (!profile) {
    console.log('Profile does not exist, creating profile...');
    const { error: insertProfileError } = await supabase
      .from('profiles') // Insert into the `profiles` table
      .insert({ 
        id: userId, 
        first_name: userData.user?.user_metadata?.firstName || 'DefaultFirstName', // Default values or extracted from metadata
        last_name: userData.user?.user_metadata?.lastName || 'DefaultLastName',
        team_name: 'DefaultTeamName' 
      });

    if (insertProfileError) {
      console.error('Error inserting profile:', insertProfileError);
      return NextResponse.json({ success: false, message: 'Error creating profile for user' }, { status: 500 });
    }
  }

  // Now insert into the members table with the new fields
  try {
    const { data, error } = await supabase
      .from('members') 
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber, 
        street_address: streetAddress, 
        city, 
        notes, 
        team_id: userId, 
      });

    if (error) {
      console.error("Error inserting data:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    console.log("Inserted member data:", data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
