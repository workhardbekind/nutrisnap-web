"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function LoginButton() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <button
        type="button"
        className="rounded border px-3 py-1.5 text-sm text-gray-600"
        disabled
      >
        Loading…
      </button>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="rounded bg-blue-600 text-white px-3 py-1.5 text-sm hover:opacity-90"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("github")}
      className="rounded bg-black text-white px-3 py-1.5 text-sm hover:opacity-90"
    >
      Sign in with GitHub
    </button>
  );
}
