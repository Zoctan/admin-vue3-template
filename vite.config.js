import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import dotenv from 'dotenv'
import fs from 'fs'
import process from 'process'

export default ({ command, mode }) => {
  let NODE_ENV = process.env.NODE_ENV || 'development';
  let envFiles = [
    /** default file */
    `.env`,
    /** mode file */
    `.env.${NODE_ENV}`
  ];
  for (const file of envFiles) {
    const envConfig = dotenv.parse(fs.readFileSync(file))
    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  }
  return defineConfig({
    plugins: [
      vue(),
      // auto import Element Plus
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve('src'),
        'api': resolve('src/api'),
        'assets': resolve('src/assets'),
        'components': resolve('src/components'),
        'utils': resolve('src/utils'),
      }
    },
    server: {
      host: process.env.VITE_HOST,
      // server port number
      port: process.env.VITE_PORT,
      // Whether to automatically open the browser when the server starting
      open: true,
      // Allow cross domain
      cors: true,
      https: false,
    },
    base: process.env.VITE_BASE_URL,
    build: {
      outDir: process.env.VITE_OUTPUT_DIR,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        }
      }
    },
    define: {
      'process.env': {}
    }
  })
}
