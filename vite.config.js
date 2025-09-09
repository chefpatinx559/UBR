import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'pages/index.html',
        login: 'pages/login.html',
        register: 'pages/register.html',
        profile: 'pages/profile.html',
        discover: 'pages/discover.html',
        matches: 'pages/matches.html',
        messages: 'pages/messages.html',
        admin: 'pages/admin.html'
      }
    }
  }
})