import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative base path for GitHub Pages compatibility
  // When deploying to a custom domain, you can remove this or set it to '/'
  base: process.env.GITHUB_ACTIONS ? '/emergency-lebanon/' : '/',
})
