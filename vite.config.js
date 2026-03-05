import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    cssMinify: true,
    // Warn at 300KB instead of default 500KB for tighter budget
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Vendor chunks — cached separately from app code ──
          if (id.includes('node_modules')) {
            // React core (rarely changes)
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Animation libraries
            if (id.includes('gsap') || id.includes('aos')) {
              return 'vendor-animation';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Icons
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Everything else in node_modules
            return 'vendor-misc';
          }

          // ── Admin panel — separate chunk ──
          if (id.includes('/admin/')) {
            return 'admin';
          }
        },
      },
    },
  },
})
