import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react()
  ],
  define: {
    global: 'globalThis',
  },
  // Plain CSS, no PostCSS plugins. Explicit, so Vite never picks up a postcss.config from a parent folder.
  css: { postcss: {} },
  build: {
    rollupOptions: {
      output: {
        // Client only: the prerender (SSR) build keeps dependencies external.
        manualChunks: isSsrBuild ? undefined : {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
        // Optimize for Cloudflare Pages CDN
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }

          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    // No public source maps: they double the deploy and publish the source.
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        // Keep console.warn/error for real problems; strip development logging.
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        drop_debugger: true,
      },
      mangle: {
        safari10: true
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  server: {
    port: 5173,
    open: true,
    // The reactions Worker under `npx wrangler dev -c workers/reactions/wrangler.jsonc` (README, Local dev).
    // .dev.vars sets its SITE_URL to this server, so the browser's own Origin passes its check.
    proxy: {
      '/api/posts': 'http://localhost:8797',
      '/api/auth': 'http://localhost:8797',
      '/api/collect': 'http://localhost:8797',
      '/api/insights': 'http://localhost:8797',
    },
  },
  preview: {
    port: 4173,
    open: true
  }
}));
