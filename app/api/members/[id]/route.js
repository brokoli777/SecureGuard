import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const errorResponse = (message, status = 500) => {
  return NextResponse.json({ success: false, message }, { status });
};

export async function GET(req, { params }) {
  const supabase = createClient();
  const { member_id } = params;

  try {
    // Fetch member by member_id
    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("member_id", member_id)
      .single();

    if (error) {
      console.error("Error fetching member data:", error);
      return errorResponse(error.message);
    }
    // Return member details
    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error("Server error:", err);
    return errorResponse("Server error");
  }
}

export async function PUT(req, { params }) {
  const supabase = createClient();
  const { id } = params;

  if (!id) {
    return errorResponse("Member ID is required", 400);
  }

  try {
    const formData = await req.formData();
    const updateData = {
      first_name: formData.get("firstName"),
      last_name: formData.get("lastName"),
      email: formData.get("email"),
      phone_number: formData.get("phoneNumber"),
      street_address: formData.get("streetAddress"),
      city: formData.get("city"),
      notes: formData.get("notes"),
    };

    // Handle image upload
    const image = formData.get("image");
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, image, { upsert: true });

      if (uploadError) {
        return errorResponse("Error uploading image");
      }

      const { data } = supabase.storage.from("photos").getPublicUrl(fileName);

      updateData.photo_url = data.publicUrl;
    }

    // Handle face descriptor
    const descriptorStr = formData.get("descriptor");
    if (descriptorStr) {
      updateData.descriptor = JSON.parse(descriptorStr).map((val) =>
        parseFloat(val)
      );
    }

    const { data, error } = await supabase
      .from("members")
      .update(updateData)
      .eq("member_id", id);

    if (error) {
      console.error("Error updating member:", error);
      return errorResponse(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      data,
    });
  } catch (err) {
    console.error("Server error:", err);
    return errorResponse("Server error");
  }
}

// Handle DELETE request (delete member by member_id)
export async function DELETE(req, { params }) {
  const supabase = createClient();
  const { member_id } = params;

  console.log("Deleting member with member_id:", member_id);

  try {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("member_id", member_id);

    if (error) {
      console.error("Error deleting member:", error);
      return errorResponse(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (err) {
    console.error("Server error", err);
    return errorResponse("Server error");
  }
}
