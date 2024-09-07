import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import UnoCSS from 'unocss/vite'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), UnoCSS()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // 设置 @ 指向 src 目录
        },
    },
    server: {
        proxy: {
            // 代理 /api 路径到目标服务器
            '/api': {
                target: 'http://localhost:8082', // 目标服务器的地址
                changeOrigin: true, // 是否修改源头
                rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径
            },
        },
    },
})
