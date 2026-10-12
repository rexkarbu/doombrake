import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.js', '.js', '.json'],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
  },
  server: {
    port: 3000,
    open: false,
  },
});
