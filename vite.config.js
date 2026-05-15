import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ALLOWED_HOST = process.env.ALLOWED_HOST
console.log(`ALLOWED_HOST: ${ALLOWED_HOST}`)

const config = {
  plugins: [react()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/process': {
        target: process.env.VITE_BIBLE_API_INTERNAL_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.js'],
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/**/*.test.js'],
    },
  },
}

if (!process.env.VITE_BIBLE_API_INTERNAL_URL) {
  console.log(
    'VITE_BIBLE_API_INTERNAL_URL is not defined. API calls will fail.'
  )
  delete config.server.proxy
}

if (ALLOWED_HOST) {
  config.server.allowedHosts = [ALLOWED_HOST]
}

// https://vite.dev/config/
export default defineConfig(config)
