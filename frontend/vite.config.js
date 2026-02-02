import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
            // Whether to polyfill specific globals.
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
    ],
    define: {
        'process.env': {},
        global: 'globalThis',
    },
    resolve: {
        alias: {
            buffer: 'buffer',
            stream: 'stream-browserify',
            crypto: 'crypto-browserify',
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
            define: {
                global: 'globalThis'
            },
        },
    },
    build: {
        target: 'esnext',
    },
    json: {
        stringify: false, // Import JSON as objects, not strings
    },
})
