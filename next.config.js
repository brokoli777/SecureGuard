/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false };
    return config;
  },
  images: {
    domains: ["atqdmbwtaewwpuefepgb.supabase.co"], // Supabase project domain
  },
};

module.exports = nextConfig;
