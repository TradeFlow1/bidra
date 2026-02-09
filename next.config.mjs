/** @type {import("next").NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  images: {
    remotePatterns: [
      ...(isDev
        ? [
            { protocol: "http", hostname: "127.0.0.1", port: "3000" },
            { protocol: "http", hostname: "localhost", port: "3000" },
          ]
        : []),
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  output: "standalone",
};

export default nextConfig;

