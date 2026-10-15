import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Builds a single main.js + main.css loaded by the WebviewPanel (no localhost / dev server needed).
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  css: { postcss: { plugins: [tailwind({ config: path.join(__dirname, 'tailwind.config.js') }), autoprefixer()] } },
  build: {
    outDir: path.join(__dirname, '..', 'dist', 'webview'),
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: path.join(__dirname, 'src', 'main.tsx'),
      output: { format: 'iife', entryFileNames: 'main.js', assetFileNames: 'main.[ext]', inlineDynamicImports: true },
    },
  },
});
