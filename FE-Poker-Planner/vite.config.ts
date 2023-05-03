import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import paths from './aliaspaths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: paths,
  },
  server: {
    port: 3000,
  },
});
