import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {},
    },
    resolve: {
        alias: {
            stream: 'stream-browserify',
            crypto: 'crypto-browserify',
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
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
})
