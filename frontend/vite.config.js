// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite'

export default defineConfig ({
    server: {
      host: '0.0.0.0',
      port: 5173,
      cors: true,
      strictPort: true,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                startpage: resolve(__dirname, 'views/startpage/index.html'),
            },
        },
    },
  });