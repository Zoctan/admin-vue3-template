import { isNavigationFailure } from 'vue-router'
import store from '@/store'
import router from '@/router'
import Permission from 'utils/Permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Navigation Guards: https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
// oreder: beforeEach -> beforeResolve -> afterEach
// has token?
//   yes:
//     route hasn't "requiresAuth" or "permission" meta tag: go directly
//     route has "requiresAuth" and "permission" meta tag:
//                                                   "requiresAuth" and no "permission": go directly
//                                                   "permission": check permission
//   no:
//     route hasn't "requiresAuth" or "permission" meta tag: go directly
//     route has "requiresAuth" and "permission" meta tag: redirect to login page

const permission = new Permission()

// flag: already added dynamic routers
let addAsyncRoutersFlag = false
const addAsyncRouters = async () => {
  console.debug('addAsyncRouters addAsyncRoutersFlag', addAsyncRoutersFlag)
  if (!addAsyncRoutersFlag && store.getters.token && store.getters.token.accessToken) {
    try {
      const accessedAsyncRouters = await store.dispatch('generateRoutes', store.getters.token)
      accessedAsyncRouters.forEach(item => router.addRoute(item))
      console.debug('addAsyncRouters accessedAsyncRouters', accessedAsyncRouters)
      addAsyncRoutersFlag = true
    } catch (error) {
      ElMessage.error(`generate routes error: ${error}`)
    }
  }
}
(async () => await addAsyncRouters())()
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  console.debug('beforeEach addAsyncRoutersFlag', addAsyncRoutersFlag)
  console.debug('beforeEach to', to)
  console.debug('beforeEach routers', router.getRoutes())
  if (store.getters.token && store.getters.token.accessToken) {
    // don't visit login again
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (!addAsyncRoutersFlag) {
        await addAsyncRouters()
        next({ ...to, replace: true })
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
            if (!to.meta.permission) {
              next()
            } else {
              if (permission.check(to.meta.permission)) {
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
    addAsyncRoutersFlag = false
    // router exists?
    if (!router.hasRoute(to.name)) {
      next({ path: '/404' })
    } else {
      if (!to.meta.requiresAuth && !to.meta.permission) {
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
