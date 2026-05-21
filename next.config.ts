import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up an unrelated lockfile in $HOME.
  turbopack: { root: projectRoot },
  images: {
    // Remote model outputs (Fal/Replicate) and mock samples are shown via <img>/<video>.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
