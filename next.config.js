/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "utfs.io",
      "uploadthing.com",
      "img.clerk.com",
      "subdomain",
      "files.stripe.com",
    ],
  },
};

module.exports = nextConfig;
