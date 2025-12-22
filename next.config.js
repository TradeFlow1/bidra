/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANT:
  // Do NOT use `output: "export"` for this project.
  // Bidra uses API routes + Prisma (server runtime) which require a Node server on Vercel.
};

module.exports = nextConfig;
