/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Added for Docker deployment https://github.com/vercel/next.js/tree/canary/examples/with-docker
}

module.exports = nextConfig
