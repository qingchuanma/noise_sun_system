// vite.config.js
import vitePluginString from 'vite-plugin-string'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default {
  plugins: [
    vitePluginString()
  ]
}


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vanilla()],
  base: '/noise_sun_system/'
})
