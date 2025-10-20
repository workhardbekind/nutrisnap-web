export const runtime = "nodejs";

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Optional one-time debug to prove it's defined:
// console.log("authOptions is defined:", !!authOptions);

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };