import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { stripCrossoriginPlugin } from './vite-plugin-crossorigin';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    stripCrossoriginPlugin()
  ],
});
