import { isNavigationFailure } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import router from '@/router'
import localStore from '@/utils/localStore'
import hasPermission from '@/utils/hasPermission'
import { ElMessage } from 'element-plus'

// 导航守卫：https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
// 顺序：beforeEach -> beforeResolve -> afterEach
// 有无 token：
//   有：
//     前往的路径无需认证 和 权限：直接前往
//     前往的路径需要认证 和 权限：
//                           需要认证，但不需要权限：直接前往
//                           需要权限：检查权限
//   无：
//     前往的路径无需认证 和 权限：直接前往
//     前往的路径需要认证 和 权限：跳到登录页
// 是否已经挂载动态路由表
let addAsyncRoutersFlag = false
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  console.debug('addAsyncRoutersFlag', addAsyncRoutersFlag)
  console.debug('to', to)
  console.debug('routers', router.getRoutes())
  if (localStore() && localStore().member.token) {
    if (!addAsyncRoutersFlag) {
      const accessedAsyncRouters = await store.dispatch('generateRoutes', localStore().member)
      accessedAsyncRouters.forEach(item => {
        router.addRoute(item)
      })
      next({ ...to })
      addAsyncRoutersFlag = true
    } else {
      // 无需认证 和 权限
      if (!to.meta.requiresAuth && !to.meta.auth) {
        next()
      } else {
        // 不要重复访问登录页
        if (to.path === '/login') {
          next({ path: '/' })
        } else {
          if (to.meta.requiresAuth && !to.meta.auth) {
            next()
          } else if (to.meta.requiresAuth && to.meta.auth && hasPermission(to.meta.auth)) {
            next()
          } else {
            ElMessage.error(`no permission to visit ${to.path}`)
          }
        }
      }
    }
  } else {
    if (!to.meta.requiresAuth && !to.meta.auth) {
      next()
    } else {
      addAsyncRoutersFlag = false
      next({ path: '/login' })
    }
  }
})

router.beforeResolve(async (to, from, next) => {
  next()
})

router.afterEach((to, from, failure) => {
  if (isNavigationFailure(failure)) {
    console.log('failed navigation', failure)
  }
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
  NProgress.done()
})
