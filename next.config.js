/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  rewrites: async () => {
    return [
      {
        source: "/images-cdn/:path*",
        destination: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfka0sdnl"}/:path*`,
      },
    ];
  },
  headers: async () => {
    return [
      // Cache Cloudinary proxy images at Vercel CDN edge for 30 days
      // This prevents hitting Cloudinary on every single request
      {
        source: "/images-cdn/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400, immutable",
          },
        ],
      },
      // Cache local static images (public/images/) at Vercel CDN edge for 1 year
      // Bots/scrapers ke repeated hits se origin server hit nahi hoga
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
