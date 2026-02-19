import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
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
      rollupOptions: {
        output: {
          // Smaller chunks = faster initial download and caching
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['react-router-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-firebase': ['firebase/app', 'firebase/auth'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
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
      // Preload critical assets
      modulePreload: {
        polyfill: true,
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
