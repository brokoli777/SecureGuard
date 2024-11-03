import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const errorResponse = (message, status = 500) => {
  return NextResponse.json({ success: false, message }, { status });
};

export async function POST(req) {
  const supabase = createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Failed to authenticate user", 401);
    }

    // Get form data
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const memberData = {
      first_name: formData.get("firstName"),
      last_name: formData.get("lastName"),
      email: formData.get("email"),
      phone_number: formData.get("phoneNumber"),
      street_address: formData.get("streetAddress"),
      city: formData.get("city"),
      notes: formData.get("notes"),
      team_id: user.id,
      descriptor: JSON.parse(formData.get("faceDescriptor")),
    };

    // Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select()
      .eq("id", user.id)
      .single();

    if (!profile && profileError?.code === "PGRST116") {
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          first_name: user.user_metadata?.firstName || "DefaultFirstName",
          last_name: user.user_metadata?.lastName || "DefaultLastName",
          team_name: "DefaultTeamName",
        });

      if (createProfileError) {
        return errorResponse("Error creating profile for user");
      }
    } else if (profileError) {
      return errorResponse(profileError.message);
    }

    // Handle image upload
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, imageFile);

      if (uploadError) {
        return errorResponse("Error uploading image");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(fileName);

      memberData.photo_url = publicUrl;
    }

    // Create member
    const { error: memberError } = await supabase
      .from("members")
      .insert(memberData);

    if (memberError) {
      return errorResponse(memberError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Member added successfully",
    });
  } catch (err) {
    console.error("Server error:", err);
    return errorResponse("Server error");
  }
}
