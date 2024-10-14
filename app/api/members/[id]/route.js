import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Handle GET request (fetch member details by member_id)
export async function GET(req, { params }) {
  const supabase = createClient();
  const { member_id } = params; // Use member_id from the dynamic route parameters

  try {
    // Fetch member by member_id
    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("member_id", member_id) // Query by member_id
      .single();

    if (error) {
      console.error("Error fetching member data:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Return member details
    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error("Server error while fetching member:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Handle PUT request (update member details by member_id)
export async function PUT(req, { params }) {
  const supabase = createClient();
  const { id } = params;
  console.log("Updating member details for member_id:", id);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Member ID is required" },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData();
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const phoneNumber = formData.get("phoneNumber");
    const streetAddress = formData.get("streetAddress");
    const city = formData.get("city");
    const notes = formData.get("notes");
    const image = formData.get("image");

    let imageUrl = null;
    if (image) {
      const file = image;
      const fileExt = file.name.split(".").pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return NextResponse.json(
          { success: false, message: "Error uploading image" },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      street_address: streetAddress,
      city,
      notes,
    };

    if (imageUrl) {
      updateData.photo_url = imageUrl;
    }

    const { data, error } = await supabase
      .from("members")
      .update(updateData)
      .eq("member_id", id);

    if (error) {
      console.error("Error updating member:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    console.log("Member updated successfully:", data);
    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      data,
    });
  } catch (err) {
    console.error("Server error while updating member:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Handle DELETE request (delete member by member_id)
export async function DELETE(req, { params }) {
  const supabase = createClient();
  const { member_id } = params; // Use member_id from the dynamic route parameters

  // Debug: Log the member_id being deleted
  console.log("Deleting member with member_id:", member_id);

  try {
    // Delete member by member_id
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("member_id", member_id); // Delete by member_id

    if (error) {
      console.error("Error deleting member:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Debug: Log successful deletion
    console.log("Member deleted successfully for member_id:", member_id);

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (err) {
    console.error("Server error while deleting member:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
