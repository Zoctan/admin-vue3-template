import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import dotenv from 'dotenv'
import fs from 'fs'

export default ({ command, mode }) => {
  let NODE_ENV = process.env.NODE_ENV || 'development';
  let envFiles = [];
  //根据不同的环境使用不同的环境变量
  if (command == 'serve') {
    envFiles = [
      /** default file */
      `.env`
    ]
  } else {
    envFiles = [
      /** default file */
      `.env`,
      /** mode file */
      `.env.${NODE_ENV}`
    ]
  }
  for (const file of envFiles) {
    const envConfig = dotenv.parse(fs.readFileSync(file))
    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  }
  return defineConfig({
    plugins: [
      vue(),
      // 自动导入 Element
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
      // 服务端口号
      port: process.env.VITE_PORT,
      // 服务启动时是否自动打开浏览器
      open: true,
      // 允许跨域
      cors: true,
      // 是否开启 https
      https: false,
    },
    base: process.env.VITE_BASE_URL,
    build: {
      outDir: process.env.VITE_OUTPUT_DIR,
    },
    define: {
      'process.env': {}
    }
  })
}
