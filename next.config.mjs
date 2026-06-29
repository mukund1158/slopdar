/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-hosted on the VPS — emit a standalone server bundle for PM2 / direct run.
  output: "standalone",
  // Playwright must run in the Node.js runtime, never get bundled into edge/serverless traces.
  serverExternalPackages: ["playwright", "playwright-core"],
  experimental: {
    // The scanner can pull in large HTML payloads; keep server actions reasonable.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
