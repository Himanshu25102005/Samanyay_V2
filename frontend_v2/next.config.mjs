/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure the app binds to 0.0.0.0 for Render deployment
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Configure for production deployment
  output: 'standalone'
};

export default nextConfig;
