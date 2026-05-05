import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    // Temporarily on so prod TDZ errors point to real symbol/file names.
    // Revert once the live bug is identified and fixed.
    sourcemap: true,
  },
})
