import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  },
  /* config options here */
};

export default nextConfig;
