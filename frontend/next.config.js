/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Allow maplibre-gl and deck.gl to work with Next.js
  transpilePackages: [
    'maplibre-gl',
    '@deck.gl/core',
    '@deck.gl/layers',
    '@deck.gl/geo-layers',
    '@deck.gl/mapbox',
  ],
}

module.exports = nextConfig
