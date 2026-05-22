import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import cesium from 'vite-plugin-cesium';
import path from 'node:path';

export default defineConfig({
  // Relative asset URLs so dist/ can be served from any subpath (IntelliJ's built-in
  // server at :63342 treats project root as web root, and any deploy under a sub-folder
  // benefits too). Vite-plugin-cesium still resolves /cesium/* absolutely for the
  // dev server; for production we rewrite below.
  base: './',
  plugins: [vue(), cesium()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor deps so they cache independently and load in parallel.
        // NOTE: 'cesium' itself is externalized by vite-plugin-cesium (loaded at runtime
        // from /cesium/Cesium.js), so it's not chunked here. cesium-navigation-es6 IS
        // bundled because it's a small wrapper that just imports cesium symbols.
        manualChunks: {
          'cesium-navigation': ['cesium-navigation-es6'],
          'element-plus': ['element-plus'],
          vue: ['vue', 'pinia'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});
