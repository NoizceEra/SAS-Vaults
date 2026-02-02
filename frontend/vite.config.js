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
            // map mobile-only package to a lightweight shim for web builds
            '@solana-mobile/mobile-wallet-adapter-protocol': path.resolve(__dirname, 'src/shims/mobile-protocol-shim.js'),
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
            define: {
                global: 'globalThis'
            },
        },
        // exclude mobile wallet protocol from pre-bundling — it's only used in native/mobile contexts
        exclude: ['@solana-mobile/mobile-wallet-adapter-protocol'],
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            external: ['@solana-mobile/mobile-wallet-adapter-protocol'],
        },
    },
    json: {
        stringify: false, // Import JSON as objects, not strings
    },
})
