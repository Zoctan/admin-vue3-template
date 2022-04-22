# ADMIN-SEED-Template

前后端分离的多用户-多角色后台权限管理 Vue 3 + Vite 模版。

![stars](https://img.shields.io/github/stars/Zoctan/admin-seed-template.svg?style=flat-square&label=Stars)
![license](https://img.shields.io/github/license/Zoctan/admin-seed-template.svg?style=flat-square)

简体中文 | [English](./README.md)

配合后端项目 [PHP-SEED-Template](https://github.com/Zoctan/php-seed-template) 的前端项目。

如果想使用本项目，而又不想使用后端项目 [PHP-SEED-Template](https://github.com/Zoctan/php-seed-template)，用其他语言实现和后端项目一致的接口吧，很简单的！

欢迎小伙伴 star 和 issues ~ 谢谢 :）

# 部署

## 依赖版本

- Node >= 16.13
- Npm >= 8.5

## 快速开始

```
# 克隆项目
git clone https://github.com/Zoctan/admin-seed-template.git

# 安装依赖
npm install

# 修改 src/router/index.js：
# 不使用域名（部署在本地，并用127.0.0.1访问）
history: createWebHashHistory()
# 使用域名（部署在本地或服务器，绑定了域名）
history: createWebHistory()

# 打包，把 dist 文件夹放到 WWW 目录下
npm run build
```

# 文件说明

```text
api：对应后端 API 接口
assets：静态资源
directive：可用于组件实例中的指令
layout：布局
router：路由
store：vuex存储
utils：工具函数
views：视图

App.vue：主视图
main.js：全局入口

.env：环境配置
.env.development：开发环境配置
.env.production：生产环境配置
.eslintrc.js：代码规范
babel.config.js：代码规范
index.html：静态入口
vite.config.js：配置
```

# 预览

![登录](https://github.com/Zoctan/admin-seed/blob/main/README/Login.jpg)

![用户角色控制](https://github.com/Zoctan/admin-seed/blob/main/README/MemberManageUpdateRole.png)

![用户管理-列表](https://github.com/Zoctan/admin-seed/blob/main/README/MemberManageList.png)

![用户管理-添加](https://github.com/Zoctan/admin-seed/blob/main/README/MemberManageAdd.png)

![角色管理-列表](https://github.com/Zoctan/admin-seed/blob/main/README/RoleManageList.png)

![角色管理-添加](https://github.com/Zoctan/admin-seed/blob/main/README/RoleManageAdd.png)

![角色管理-更新](https://github.com/Zoctan/admin-seed/blob/main/README/RoleManageUpdate.png)

![角色管理-规则](https://github.com/Zoctan/admin-seed/blob/main/README/RoleManageRule.png)

![上传](https://github.com/Zoctan/admin-seed/blob/main/README/ImageUpload.png)

![键值对-列表](https://github.com/Zoctan/admin-seed/blob/main/README/PairList.png)

![日志-列表](https://github.com/Zoctan/admin-seed/blob/main/README/LogList.png)

# 文档参考

- [Axios：基于 promise 网络请求库](https://axios-http.com/zh/docs/intro)
- [Element Plus：Vue3 组件库](https://element-plus.gitee.io/zh-CN/)
- [Vue3 构建用户界面的渐进式框架](https://v3.cn.vuejs.org/guide/introduction.html)
- [Vite：下一代前端开发与构建工具](https://vitejs.cn/guide)
- [Vuex：专为 Vue.js 应用程序开发的状态管理模式 + 库](https://vuex.vuejs.org/zh)
- [Vue Router：Vue.js 的官方路由](https://router.vuejs.org/zh)
- [NProgress：进度条](https://github.com/rstacruz/nprogress)

# 依赖

- [@babel/eslint-parser](https://www.npmjs.com/package/@babel/eslint-parser)
- [@vitejs/plugin-vue](https://www.npmjs.com/package/@vitejs/plugin-vue)
- [babel-plugin-import 按需加载](https://www.npmjs.com/package/babel-plugin-import)
- [eslint 静态代码分析](https://eslint.org/docs/user-guide/configuring)
- [eslint-plugin-vue 是 Vue.js 的官方 ESLint 插件](https://eslint.vuejs.org)

## 安装第三方插件更新依赖

```
// 安装第三方插件检查依赖最新版本
npm install -g npm-check-updates
// 查看 package.json 可更新包
ncu --packageFile package.json
// 更新 package.json 版本号
ncu -u --packageFile package.json
// 安装最新版本
npm install
```

# IDE 推荐

- [VSCode](https://code.visualstudio.com) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
