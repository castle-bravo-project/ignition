import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ignition-github-app/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
