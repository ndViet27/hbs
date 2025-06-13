import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
// import { version } from './package.json'
import { visualizer } from "rollup-plugin-visualizer";
const version = (new Date()).getTime()
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) =>({
  build: {
    target: 'esnext',
    modulePreload: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${version}.js`,
        chunkFileNames: `assets/[name]-${version}.js`,
        assetFileNames: ({ name }) => {
          if (/\.css$/i.test(name ?? '')) {
            return `assets/[name]-${version}.[ext]`
          }
          return `assets/[name].[ext]`
        },
        manualChunks(id) {
          if (id.includes('assets')) {
            return `styles`
          }
        }
      }
    },
    // sourcemap: command === 'dev' ? 'inline' : false,
    cssCodeSplit: true,
  },
  plugins: [
    vue(),
    vuetify(),
    visualizer(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          $app-name: 'hocbaso';
          $public-path: "";
        `,
        sassOptions: {
          outputStyle: 'expanded',
          charset: false
        }
      }
    }
  },
  esbuild: {
    charset: 'ascii'
  },
  server: {
    // host: '0.0.0.0',
    port: 5173,
    hmr: true,
    cors: true
  },
  base: './'
}))
