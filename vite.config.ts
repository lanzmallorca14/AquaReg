import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // Ginawang relative para gumana kahit saang URL o deployment path
  base: './', 
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ 
      open: false,
      filename: 'dist/stats.html' 
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Safe automatic chunking na walang circular dependency risks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@mui') || id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
          }
        },
      },
    },
  },
});