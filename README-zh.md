# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

# 文档参考

- [Axios 基于 promise 网络请求库](https://axios-http.com/zh/docs/intro)
- [Vant 移动端 Vue 组件库](https://vant-contrib.gitee.io/vant/#/zh-CN)
- [Vue3 构建用户界面的渐进式框架](https://v3.cn.vuejs.org/guide/introduction.html)
- [Vite 下一代前端开发与构建工具](https://vitejs.cn/guide)
- [Vuex 专为 Vue.js 应用程序开发的状态管理模式 + 库](https://vuex.vuejs.org/zh)
- [Vue Router 是 Vue.js 的官方路由](https://router.vuejs.org/zh)
- [NProgress 进度条](https://github.com/rstacruz/nprogress)

# IDE 推荐

- [VSCode](https://code.visualstudio.com) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

# 依赖

- [@babel/eslint-parser](https://www.npmjs.com/package/@babel/eslint-parser)
- [@vitejs/plugin-vue](https://www.npmjs.com/package/@vitejs/plugin-vue)
- [babel-plugin-import 按需加载](https://www.npmjs.com/package/babel-plugin-import)
- [eslint 静态代码分析](https://eslint.org/docs/user-guide/configuring)
- [eslint-plugin-vue 是 Vue.js 的官方 ESLint 插件](https://eslint.vuejs.org)

## 安装第三方插件更新依赖

// 安装第三方插件检查依赖最新版本
npm install -g npm-check-updates
// 查看可更新包
ncu --packageFile package.json
// 更新
ncu -u --packageFile package.json
// 升级到最新版本
npm install
