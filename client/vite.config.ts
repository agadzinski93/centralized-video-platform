import { defineConfig } from 'vitest/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const overwritePath = (process.env.NODE_ENV !== 'production') ? /\/api\/v1/ : '';

  return {
    plugins: [react(), nodePolyfills()],
    base: '/',
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
          target: (process.env.NODE_ENV === 'production') ?
            'http://localhost:5000' : `http://${env.VITE_PROXY_TARGET_HOST}:5000`,
          secure: (process.env.NODE_ENV === 'production') ? true : false,
          changeOrigin: true,
          rewrite: (path) => path.replace(overwritePath, ''),
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