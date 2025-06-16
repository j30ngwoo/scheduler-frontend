import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 로컬 개발용
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    host: true, // 외부 호스트 바인딩
    allowedHosts: [
      'scheduler.j30ngwoo.site',
      'j30ngwoo.site',
      'localhost'
    ],
  },
})

