import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { unlinkSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  base: './', // Use relative paths - works anywhere
  publicDir: 'public',
  plugins: [
    vue(),
    {
      name: 'exclude-public-files',
      closeBundle() {
        // Delete jobs-export.json from dist after build
        // This file should be generated on the server, not bundled
        const filePath = resolve(__dirname, 'dist', 'jobs-export.json')
        if (existsSync(filePath)) {
          unlinkSync(filePath)
          console.log('Removed jobs-export.json from dist (will be generated on server)')
        }
      },
    },
  ],
})
