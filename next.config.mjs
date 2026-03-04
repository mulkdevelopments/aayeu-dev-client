import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '..'),
  },
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
