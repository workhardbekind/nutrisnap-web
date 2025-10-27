"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Sign in to NutriSnap</h1>
        <button
          onClick={() => signIn("github")}
          className="w-full rounded bg-black text-white py-2 hover:opacity-90"
        >
          Continue with GitHub
        </button>

        {/* Uncomment if EmailProvider configured */}
        {/* <button
          onClick={() => signIn("email", { callbackUrl: "/dashboard" })}
          className="w-full rounded border py-2 hover:bg-gray-50"
        >
          Continue with Email
        </button> */}
      </div>
    </main>
  );
}
