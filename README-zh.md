# ADMIN-SEED

![stars](https://img.shields.io/github/stars/Zoctan/admin-seed.svg?style=flat-square&label=Stars)
![license](https://img.shields.io/github/license/Zoctan/admin-seed.svg?style=flat-square)

简体中文 | [English](./README.md)

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

# Token 刷新策略

SEED 项目选择在后端签发：accessToken、refreshToken，在前端请求拦截响应后刷新 accessToken 的策略。

## 分类讨论

1.后端签发：accessToken（可选：expired）；
前端在 accessToken 过期前，申请刷新；过期后重新登录。

2.后端签发：accessToken、refreshToken（可选：expired）；
前端在 accessToken 过期后，可以采取多种策略使用 refreshToken 不断刷新 accessToken，保证用户一直无感在线。

什么时候需要 expired？
前后端商量好过期时间就不用，只是后期可能增加商量的时间和修改前端的成本，expired 字段可以节省成本。

为什么需要 refreshToken？
accessToken 存在网络传输泄露风险，因为 accessToken 需要在请求中频繁用到，所以不能用作刷新。
refreshToken 本身没多少次传输，只有登录时，刷新时，本身过期需要刷新时才会在网络中出现，其他时间都在本地储存，泄露风险相对较低。

## 单纯前端实现

### accessToken 刷新策略有三种

1.全局维护刷新倒计时器：【后端：accessToken、refreshToken（可选：expired）；前端：保存 token 的时间 saveTokenDate】
    登录或注册后开启倒计时【分钟级】（App.vue也要加入倒计时，防止页面刷新，倒计时被销毁），倒计时到达刷新时间，使用 refreshToken 请求续期 accessToken。
    倒计时要结合 saveTokenDate，不然用户退出网页一段时间再回来会导致倒计时错误。
    优点：用户无感，即使无请求动作，只要开着网页即可续期。
    缺点：本地时间在开启网页后中途乱改，导致倒计时出错（可能性低）。

2.在请求拦截中刷新【请求前或响应后】:
    请求前：【后端：accessToken、refreshToken（可选：expired）；前端：保存 token 的时间 saveTokenDate】
        和全局维护倒计时器差不多，每次请求前检查是否到达刷新时间。
        优点：无需维护计时器。
        缺点：有本地时间乱改的风险；
              需要用户有请求动作；
              需要前端有实时保存动作，避免长时间没有请求动作时表单之类的数据丢失，影响用户体验。

    响应后：【后端：accessToken、refreshToken】
        响应提示 accessToken 过期就使用 refreshToken 请求续期。
        优点：无需判断时间；
              无需维护计时器。
        缺点：需要用户有请求动作；
              需要前端有实时保存动作。

以上策略在 refreshToken 也过期时都需要跳转至登录页。

### refreshToken 刷新策略有两种

1.采用全局维护刷新倒计时器：和上面的策略一致。

2.每次请求都刷新 refreshToken，或者达到什么请求条件（比如超过50次请求，具体的几个时间段仍然在线）就请求刷新：
    优点：无需额外字段 expired；
          无需开倒计时器，维护简单。

什么时候刷新 refreshToken？
看项目需要，如果 refreshToken 有效时间长达半个月、一个月都无所谓，那不刷新也没事。
refreshToken 本身泄露风险不高，除非 accessToken 时间极短，需要频繁刷新。

## 后端 + 前端

只签发 accessToken：
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
