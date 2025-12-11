/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  // swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "peppela.com",
      },
      {
        protocol: "https",
        hostname: "bdroppy.s3.fr-par.scw.cloud",
      },
      {
        protocol: "https",
        hostname: "ld-cdn.fra1.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "bknd.aayeu.com",
      },
      {
        protocol: "https",
        hostname: "www.aayeu.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
