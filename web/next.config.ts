import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plain HTML/CSS/JS files in out/, served by FastAPI's StaticFiles. No Node server in production.
  output: "export",
  // /terms/ becomes terms/index.html, matching the existing URLs.
  trailingSlash: true,
};

export default nextConfig;
