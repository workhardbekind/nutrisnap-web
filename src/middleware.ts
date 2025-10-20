export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/api/meals/:path*",
    "/api/trends",
    "/api/suggestions",
  ],
};