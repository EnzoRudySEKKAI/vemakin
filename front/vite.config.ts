import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      target: ['es2020', 'safari14'],
      cssTarget: 'safari14',
      // Optimize chunk size for faster loading
      chunkSizeWarningLimit: 500,
      // Enable CSS code splitting for better caching
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Dynamic chunking based on dependencies
          // Separates critical (react, router) from non-critical (motion, firebase)
          manualChunks: (id) => {
            // React and React DOM - critical for initial render
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Router - critical for navigation
            if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/router')) {
              return 'vendor-router';
            }
            // Framer-motion - can be deferred, not needed for LCP
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/@emotion')) {
              return 'vendor-motion';
            }
            // Firebase - can be deferred, auth not needed for initial paint
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'vendor-firebase';
            }
            // Query - needed for data but can be deferred slightly
            if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/@tanstack/query-core')) {
              return 'vendor-query';
            }
            // UI utilities - critical for styling
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
              return 'vendor-ui';
            }
            // Date utilities - often large, separate them
            if (id.includes('node_modules/date-fns')) {
              return 'vendor-dates';
            }
          },
          // Add content hash for better caching
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name ? assetInfo.name.split('.') : [];
            const ext = info[info.length - 1];
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (ext === 'css') {
              return 'assets/styles/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      // Minify for production (using esbuild which is built-in)
      minify: 'esbuild',
      // Enable module preload polyfill for better chunk loading
      modulePreload: {
        polyfill: true
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'firebase/app', 'firebase/auth', '@emotion/is-prop-valid', '@emotion/styled'],
      // Force include to ensure these are bundled
      esbuildOptions: {
        target: 'es2020',
      },
    },
  };
});
