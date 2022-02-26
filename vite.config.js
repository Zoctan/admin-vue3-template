import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

let config = {
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
      'components': resolve('src/components'),
    }
  },
  server: {
    port: 8888, // 服务端口号
    open: true, // 服务启动时是否自动打开浏览器
    cors: true, // 允许跨域
  }
}

export default defineConfig(({ command, mode }) => {
  console.debug('mode', mode)
  if (command === 'serve') {
    //
  } else if (command === 'build') {
    config.base = '/php-seed/admin-vue/dist/'
  }
  return config
})
