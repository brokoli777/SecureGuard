"use client";

import { useEffect } from "react";
import { handleSignInWithGoogle } from "@/app/actions";

export default function GoogleAuth() {
useEffect(() => {

  // Has to be loaded in the global scope
  window.handleSignInWithGoogle = handleSignInWithGoogle;

  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {

      // Initialize the Google sign-in button after the script is loaded
      window.google.accounts.id.initialize({
        client_id: '96323231319-d1ar6q42jpjj0do9178ro8rbak51p2ph.apps.googleusercontent.com',
        callback: handleSignInWithGoogle,
      });

      // Render the Google sign-in button
      window.google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
        }
      );

    };

    // Append the script to the body of the document
    document.body.appendChild(script);

    // Clean up the script when the component is unmounted
    return () => {
      document.body.removeChild(script);
    };
  }
}, []); // This runs only once, when the component is mounted

  return (
    <div className="mx-auto p-5 text-center">
      <div
        id="g_id_onload"
        data-client_id="96323231319-d1ar6q42jpjj0do9178ro8rbak51p2ph.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        // data-nonce=""
        // data-auto_select="true"
        // data-itp_support="true"
        data-use_fedcm_for_prompt="true"
      ></div>

      <div
        id="g_id_signin"
        className="g_id_signin"
        style={{ colorScheme: 'normal' }}
      ></div>
    </div>
  );
}
