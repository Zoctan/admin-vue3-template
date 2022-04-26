# admin-vue3-template

A Vue 3 + Vite template for multi-user and multi-role background permission management with front and back ends separated.

![stars](https://img.shields.io/github/stars/Zoctan/admin-vue3-template.svg?style=flat-square&label=Stars)
![license](https://img.shields.io/github/license/Zoctan/admin-vue3-template.svg?style=flat-square)

English | [简体中文](./README-zh.md)

Front-end project with back-end project [php-seed](https://github.com/Zoctan/php-seed).

If you want to use this project but don't want to use the back-end project [php-seed](https://github.com/Zoctan/php-seed), use other languages to implement the same interface as the back-end project,Very simple!

Welcome friends to star and issues ~ thank you :)

# Deploy

## Dependency version

- Node >= 16.13
- Npm >= 8.5

## Quick start

```
# clone project
git clone https://github.com/Zoctan/admin-vue3-template.git

# install dependencies
npm install

# modified src/router/index.js:
# not use a domain name (deployed locally and accessed with 127.0.0.1)
history: createWebHashHistory()
# use a domain name (deployed locally or on a server, bind a domain name)
history: createWebHistory()

# build and put the 'dist' folder in the 'WWW' directory
npm run build
```

# File description

```text
api: back-end API request
assets: static resources
directive: directives available in component instances
layout: page Layout
router: router
store: vuex store
utils: tool function
views: views

App.vue: main view
main.js: global entry

.env: environment configuration
.env.development: development environment configuration
.env.production: production environment configuration
.eslintrc.js: code specification
babel.config.js: code specification
index.html: static entry
vite.config.js: vite configuration
```

# Preview

![Login](https://github.com/Zoctan/admin-vue3-template/blob/main/README/Login.jpg)

![Update Member Role](https://github.com/Zoctan/admin-vue3-template/blob/main/README/MemberManageUpdateRole.jpg)

![Member Manage-List](https://github.com/Zoctan/admin-vue3-template/blob/main/README/MemberManageList.jpg)

![Member Manage-Add](https://github.com/Zoctan/admin-vue3-template/blob/main/README/MemberManageAdd.jpg)

![Role Manage-List](https://github.com/Zoctan/admin-vue3-template/blob/main/README/RoleManageList.jpg)

![Role Manage-Add](https://github.com/Zoctan/admin-vue3-template/blob/main/README/RoleManageAdd.jpg)

![Role Manage-Update](https://github.com/Zoctan/admin-vue3-template/blob/main/README/RoleManageUpdate.jpg)

![Role Manage-Rule](https://github.com/Zoctan/admin-vue3-template/blob/main/README/RoleManageRule.jpg)

![Upload](https://github.com/Zoctan/admin-vue3-template/blob/main/README/ImageUpload.jpg)

![Pair-List](https://github.com/Zoctan/admin-vue3-template/blob/main/README/PairList.jpg)

![Log-List](https://github.com/Zoctan/admin-vue3-template/blob/main/README/LogList.jpg)

# Documentation reference

- [Axios: Promise based HTTP client for the browser and node.js](https://axios-http.com/docs/intro)
- [Element Plus: Vue3 based component library](https://element-plus.gitee.io/en-US/)
- [Vue3: JavaScript framework for building user interfaces](https://vuejs.org/guide/introduction.html)
- [Vite: Build tool](https://vitejs.dev/guide/)
- [Vuex: State management pattern + library for Vue.js](https://vuex.vuejs.org/index.html)
- [Vue Router: Official router for Vue.js](https://router.vuejs.org/guide/)
- [NProgress: Minimalist progress bar](https://github.com/rstacruz/nprogress)

# IDE Recommendation

- [VSCode](https://code.visualstudio.com) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
