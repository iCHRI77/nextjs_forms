import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// next.config.js
module.exports = {
  async headers() {
    return [
      {
        // Aplica a todas las rutas (puedes limitar a la ruta del iframe si lo prefieres)
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // o 'SAMEORIGIN' si solo será usado dentro del mismo dominio
          },
        ],
      },
    ];
  },
};

export default nextConfig;
