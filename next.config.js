/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com', 'media.licdn.com'],
  },
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
  // Optimize for Vercel deployment
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig 