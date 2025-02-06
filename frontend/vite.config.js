import { defineConfig } from "vite"
import { fileURLToPath, URL } from "url"
import postcss from "./postcss.config.js"
import reactSwc from "@vitejs/plugin-react-swc"
import react from "@vitejs/plugin-react"
import dns from "dns"
import { visualizer } from "rollup-plugin-visualizer"
import path from 'path'

dns.setDefaultResultOrder("verbatim")

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: [
    './public/piper/ort-wasm-simd-threaded.wasm',
    './public/piper/piper_phonemize.wasm',
    './public/piper/piper_phonemize.data',
  ],
  worker: {
    format: 'es'
  },
  server: {
    port: 3000,
    host: "localhost",
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE || 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },
  define: {
    "process.env": process.env
  },
  css: {
    postcss
  },
  plugins: [
    process.env.USE_SWC ? reactSwc() : react(),
    visualizer({
      template: "treemap",
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "bundleinspector.html"
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'process': 'process/browser',
    }
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'index.css';
          return assetInfo.name;
        },
      },
      external: [
        /@phosphor-icons\/react\/dist\/ssr/,
      ]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ["@mintplex-labs/piper-tts-web"],
    esbuildOptions: {
      define: {
        global: "globalThis"
      },
      plugins: []
    }
  }
})
