/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites to localhost:5000 default to a 30s proxy timeout → "socket hang up" / ECONNRESET while OpenAI images generate.
  experimental: {
    proxyTimeout: 600_000, // 10 minutes (ms); see next/dist/server/lib/router-utils/proxy-request.js
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
