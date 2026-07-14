import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server config. The `/api` proxy below only matters when running
// `vercel dev` locally (it lets your React app call /api/... during
// development the same way it will in production).
export default defineConfig({
  plugins: [react()],
})
