import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // 產品、開發中 的路徑䛀定
  // :的前面是 正式環境，：的後面是 開發中環境。
    base: process.env.NODE_ENV === 'production' ? '/react-gh-pages-sample/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',      // 監聽所有網路介面
    port: 5174,           // 可自訂埠號
    strictPort: false,    // 如果埠號被占用，自動嘗試下一個 
    // strictPort: true,     
  },
})