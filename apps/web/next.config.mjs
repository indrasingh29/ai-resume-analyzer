/** @type {import('next').NextConfig} */
const apiInternalUrl =
  process.env.API_INTERNAL_URL ||
  (process.env.API_INTERNAL_HOSTPORT
    ? `http://${process.env.API_INTERNAL_HOSTPORT}`
    : "http://localhost:4000");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
