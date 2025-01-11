/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/webhooks/clerk",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Svix-Id, Svix-Timestamp, Svix-Signature" },
        ],
      },
    ];
  },
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com']
  }
};

module.exports = nextConfig;