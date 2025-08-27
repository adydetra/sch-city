import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import gltf from 'vite-plugin-gltf';

export default defineConfig({
  plugins: [
    react(),
    gltf({
      transforms: [],
    }),
  ],
  base: './',
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src'),
      },
    ],
  },
});
