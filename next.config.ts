import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mermaidはクライアントサイド専用のため、サーバーサイドでのインポートを防ぐ
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'mermaid'];
    }
    return config;
  },
};

export default nextConfig;
