/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif|jpeg|svg)$/i,
      type: 'asset/resource'
    })
    return config
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig 