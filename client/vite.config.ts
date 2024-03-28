import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  return {
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
          // Env value must either be docker service name OR hostname/IP (e.g. localhost)
          target: `http://${env.VITE_PROXY_TARGET_HOST}:5000`,
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
  }
})