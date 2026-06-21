import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sapataria-digital/',
  plugins: [
    react(),
    {
      name: 'redirect-base-without-trailing-slash',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url === '/sapataria-digital') {
            response.statusCode = 302
            response.setHeader('Location', '/sapataria-digital/')
            response.end()
            return
          }

          next()
        })
      },
    },
  ],
  server: {
    open: '/sapataria-digital/',
  },
})
