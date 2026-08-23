import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: '/', // Ensures correct asset path resolution on Vercel
  plugins: [
    // Ang React at Tailwind plugins ay kailangan para sa build,
    // huwag silang buburahin.
    react(),
    tailwindcss(),
    // Bundle size visualizer plugin (open: false para hindi mag-error sa Vercel)
    visualizer({ 
      open: false,
      filename: 'dist/stats.html' 
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    chunkSizeWarningLimit: 1600, // Safe limit for real-world apps with UI icons
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Puts heavy node_modules libraries into separate vendor files for better caching
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});