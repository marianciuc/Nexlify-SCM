import {defineConfig} from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

import {TanStackRouterVite} from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        TanStackRouterVite({autoCodeSplitting: true}),
        viteReact(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), './src'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8888',
                changeOrigin: true,
                secure: false,
            },
        },
    }
})
