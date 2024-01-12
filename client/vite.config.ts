import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js'
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      "/api/v1": {
        target: "http://localhost:5000",
        secure: (process.env.NODE_ENV === 'production') ? true : false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ''),
        configure: proxy => {
          proxy.on('error', err => {
            console.error(`Proxy Error Message: ${err}`);
          })
        }
      }
    }
  }
})
