import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import UnoCSS from 'unocss/vite'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // 设置 @ 指向 src 目录
        },
    },
    server: {
        proxy: {
            // 代理 /api 路径到目标服务器
            '/api': {
                target: 'https://127.0.0.1:8082', // 目标服务器的地址
                changeOrigin: true, // 是否修改源头
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径
            },
            '/socket': {
                target: 'wss://127.0.0.1:8082', // WebSocket 的目标地址
                changeOrigin: true,
                secure: false, // 如果目标服务器使用自签名证书
                ws: true, // 支持 WebSocket
                rewrite: (path) => path.replace(/^\/socket/, ''), // 重写路径
            },
        },
    },
})
