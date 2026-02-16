/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["mongoose", "bcryptjs", "jsonwebtoken"],
}

export default nextConfig
