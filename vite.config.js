import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import UnoCSS from 'unocss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),UnoCSS()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 设置 @ 指向 src 目录
    },
  },
})
