import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    host: '0.0.0.0', // Allow access from local network
    port: 5173,      // Default port (you can change it if needed)
  },
})
