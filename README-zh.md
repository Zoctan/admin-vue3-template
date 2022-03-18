# ADMIN-SEED

![stars](https://img.shields.io/github/stars/Zoctan/admin-seed.svg?style=flat-square&label=Stars)
![license](https://img.shields.io/github/license/Zoctan/admin-seed.svg?style=flat-square)

简体中文 | [English](./README.md)

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

# Token 刷新策略

SEED 项目选择在前端请求拦截响应后刷新。

## 前端

1.登录或注册后保存 accessToken、refreshToken、expired；

2.刷新策略有两种：
    1.全局维护刷新倒计时器（需要记录保存的时间 saveTokenDate）
    2.在请求拦截中刷新（请求前或响应后）

3.全局维护刷新倒计时器：
    登录或注册后开启倒计时（分钟级）（App.vue也要加入倒计时，防止页面刷新，倒计时被销毁），倒计时到达刷新时间，使用 refreshToken 请求续期 accessToken。
    优点：用户无感，即使无请求动作，只要开着网页即可续期。
    缺点：后端额外提供 accessToken 的有效时间字段 expired；
          本地时间在开启网页后中途更改，导致倒计时出错（可能性低）。

4.在请求拦截中刷新（请求前或响应后）:
    请求前：和全局维护倒计时器差不多，也需要记录保存的时间 saveTokenDate，每次请求前检查是否到达刷新时间。
        优点：无需维护计时器，节省计算资源。
        缺点：需要额外字段 expired，有本地时间乱改的问题；
              需要 refreshToken 的有效时间长；
              需要前端有实时保存动作，长时间没有请求动作时数据丢失，影响用户体验。

    响应后：响应提示 accessToken 过期就使用 refreshToken 刷新，如果 refreshToken 也过期就跳转至登录页。
        优点：无需额外字段 expired；
              无需判断时间；
              无需维护计时器。
        缺点：需要用户有请求动作；
              需要 refreshToken 的有效时间长；
              需要前端有实时保存动作。

## 后端

1.刷新策略有一种：

2.只签发 accessToken：
    每次拦截请求，成功响应后，都检查 accessToken，如果即将过期，在响应字段中签发新的 accessToken，前端拦截每次响应并检查 accessToken 是否有更新。
    优点：无需额外字段 refreshToken、expired；
    缺点：需要用户有请求动作；
          需要 accessToken 的有效时间长；
          需要前端有实时保存动作。

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
// 查看 package.json 可更新包
ncu --packageFile package.json
// 更新 package.json 版本号
ncu -u --packageFile package.json
// 安装最新版本
npm install
