import { isNavigationFailure } from 'vue-router'
import store from '@/store'
import router from '@/router'
import Permission from 'utils/Permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Navigation Guards: https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
// oreder: beforeEach -> beforeResolve -> afterEach
const permission = new Permission()

// flag: already added dynamic routers
let addAsyncRoutersStatus = null
const addAsyncRouters = async () => {
  console.debug('addAsyncRouters flag', addAsyncRoutersStatus)
  if (addAsyncRoutersStatus === null && store.getters.token && store.getters.token.accessToken) {
    try {
      const accessedAsyncRouters = await store.dispatch('generateRoutes')
      accessedAsyncRouters.forEach(item => router.addRoute(item))
      console.debug('addAsyncRouters routers', accessedAsyncRouters)
      addAsyncRoutersStatus = true
    } catch (error) {
      addAsyncRoutersStatus = false
      console.error('generate routes error', error)
      ElMessage.error(`generate routes error: ${error}`)
    }
  }
}
(async () => await addAsyncRouters())()

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  console.debug('beforeEach addAsyncRoutersStatus', addAsyncRoutersStatus)
  console.debug('beforeEach to', to)
  console.debug('beforeEach routers', router.getRoutes())
  // no token
  if (!store.getters.token || !store.getters.token.accessToken) {
    addAsyncRoutersStatus = null
    // router exists?
    // don't put {path:'/:pathMatch(.*)*', redirect:'/404'} into constRouters
    // if routers are dynamic created, refresh action will redirect to 404 page directly
    // because refreshed action completed first, and dynamic routers are not created yet
    if (!router.hasRoute(to.name)) {
      return next({ path: '/404' })
    }

    if (to.meta.auth || to.meta.permission) {
      return next({ path: '/login', query: { redirect: from.fullPath } })
    }
  }

  // has token
  if (store.getters.token && store.getters.token.accessToken) {
    // don't visit login page again
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    if (addAsyncRoutersStatus === null) {
      await addAsyncRouters()
      return next({ ...to, replace: true })
    }

    if (addAsyncRoutersStatus === false || !router.hasRoute(to.name)) {
      addAsyncRoutersStatus = null
      return next({ path: '/404' })
    }

    if (to.meta.auth && to.meta.permission) {
      if (!permission.check(to.meta.permission)) {
        ElMessage.error(`no permission to visit ${to.path}`)
        return next({ path: '/401' })
      }
    }
  }

  return next()
})

router.beforeResolve((to, from, next) => {
  next()
})

router.afterEach((to, from, failure) => {
  if (isNavigationFailure(failure)) {
    console.error('failed navigation', failure)
  }
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth <= fromDepth ? 'slide-right' : 'slide-left'
  NProgress.done()
})
