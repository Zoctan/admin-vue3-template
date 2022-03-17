import { isNavigationFailure } from 'vue-router'
import store from '@/store'
import router from '@/router'
import localStore from '@/utils/localStore'
import hasPermission from '@/utils/hasPermission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Navigation Guards: https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
// oreder: beforeEach -> beforeResolve -> afterEach
// has token?
//   yes:
//     route hasn't "requiresAuth" and "auth" meta tag: go directly
//     route has "requiresAuth" and "auth" meta tag:
//                                                   "requiresAuth" and no "auth": go directly
//                                                   "auth": check permission
//   no:
//     route hasn't "requiresAuth" and "auth" meta tag: go directly
//     route has "requiresAuth" and "auth" meta tag: redirect to login page
// flag: already added dynamic routers
let addAsyncRoutersFlag = false
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  console.debug('addAsyncRoutersFlag', addAsyncRoutersFlag)
  console.debug('to', to)
  console.debug('routers', router.getRoutes())
  if (localStore() && localStore().token.token) {
    // don't visit login again
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (!addAsyncRoutersFlag) {
        const accessedAsyncRouters = await store.dispatch('generateRoutes', localStore().member)
        accessedAsyncRouters.forEach(item => router.addRoute(item))
        addAsyncRoutersFlag = true
        next({ ...to })
      } else {
        // router exists?
        // don't put {path:'/:pathMatch(.*)*', redirect:'/404'} into constRouters
        // if routers are dynamic created, refresh action will redirect to 404 page directly
        // because refreshed action completed first, and dynamic routers are not created yet
        if (!router.hasRoute(to.name)) {
          next({ path: '/404' })
        } else {
          if (!to.meta.requiresAuth) {
            next()
          } else {
            if (!to.meta.auth) {
              next()
            } else {
              if (hasPermission(to.meta.auth)) {
                next()
              } else {
                next({ path: '/401' })
                ElMessage.error(`no permission to visit ${to.path}`)
              }
            }
          }
        }
      }
    }
  } else {
    // router exists?
    if (!router.hasRoute(to.name)) {
      next({ path: '/404' })
    } else {
      if (!to.meta.requiresAuth && !to.meta.auth) {
        next()
      } else {
        next({ path: '/login', query: { redirect: from.fullPath } })
      }
    }
  }
})

router.beforeResolve((to, from, next) => {
  next()
})

router.afterEach((to, from, failure) => {
  if (isNavigationFailure(failure)) {
    console.log('failed navigation', failure)
  }
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth <= fromDepth ? 'slide-right' : 'slide-left'
  NProgress.done()
})
