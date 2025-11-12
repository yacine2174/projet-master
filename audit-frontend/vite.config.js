import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to handle port conflicts gracefully
const portConflictHandler = () => ({
  name: 'port-conflict-handler',
  configureServer(server) {
    server.httpServer?.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('\nPort 3001 is already in use. Server may already be running.')
        console.log('Visit: http://localhost:3001\n')
        process.exit(0)
      }
    })
  }
})

export default defineConfig({
  plugins: [react(), portConflictHandler()],
  server: {
    port: 3001,
    host: '0.0.0.0', // Listen on all network interfaces
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://192.168.100.244:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})