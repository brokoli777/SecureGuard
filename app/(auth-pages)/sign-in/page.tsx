"use client";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useEffect } from "react";
import { handleSignInWithGoogle } from "@/app/actions";

// Extend the Window interface to include handleSignInWithGoogle
declare global {
  interface Window {
    handleSignInWithGoogle?: (response: any) => Promise<void>;
  }
}


export default function Login({ searchParams }: { searchParams: Message }) {

  useEffect(() => {
    // Attach to window so it's accessible globally
    window.handleSignInWithGoogle = handleSignInWithGoogle;

    // Cleanup the global function when the component unmounts
    return () => {
      delete window.handleSignInWithGoogle;
    };
  }, []); // Runs only once, when the page is loaded


  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
      {/* <p className="font-semibold text-md text-center p-3">OR</p> */}
        <div
        id="g_id_onload"
        data-client_id="96323231319-d1ar6q42jpjj0do9178ro8rbak51p2ph.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-nonce=""
        data-auto_select="true"
        data-itp_support="true"
        data-use_fedcm_for_prompt="true"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
        style={{colorScheme: "normal"}}
      ></div>
    </form>
  );
}
