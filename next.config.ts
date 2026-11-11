import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bukan output statis lagi: API /api/quote butuh server (serverless di Vercel).
  trailingSlash: true,
  images: {
    // Gambar disajikan apa adanya (sudah dikompres sendiri, dan ilustrasi berupa SVG).
    unoptimized: true,
  },
};

export default nextConfig;
