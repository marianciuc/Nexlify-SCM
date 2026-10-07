/// <reference types="vitest" />
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
        host: true,
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8090',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'tanstack-vendor': ['@tanstack/react-router', '@tanstack/react-query'],
                    'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
                    'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
                    'radix-vendor': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-select',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip',
                        '@radix-ui/react-alert-dialog',
                    ],
                    'icons': ['lucide-react'],
                    'leaflet-vendor': ['leaflet'],
                },
            },
        },
    },
    test: {
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
})
