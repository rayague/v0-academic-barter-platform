/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // 🔒 Strict TypeScript for production
  },
  images: {
    unoptimized: true,
  },
  // Optimisations pour réduire le temps de compilation
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },
  // Désactiver la compression pour le dev
  compress: false,
}

export default nextConfig
