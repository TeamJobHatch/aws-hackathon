/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com', 'media.licdn.com'],
  },
  // Optimize for Vercel deployment
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig 