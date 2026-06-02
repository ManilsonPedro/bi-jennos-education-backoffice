/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Saida auto-contida para a imagem Docker (server minimo + assets).
  output: 'standalone',
};

export default nextConfig;
