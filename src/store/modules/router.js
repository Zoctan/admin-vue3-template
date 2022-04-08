import { constRouters, asyncRouters } from '@/router'
import { validateAccessToken } from 'api/member'
import Permission from 'utils/Permission'

const permission = new Permission()

const defaultState = () => {
  return {
    accessedRouters: constRouters,
    accessedAsyncRouters: []
  }
}

export default {
  state: defaultState(),

  mutations: {
    SET_ROUTERS: (state, routers) => {
      // 路由合并，成为本成员最终可以访问的路由
      state.accessedRouters = constRouters.concat(routers)
      state.accessedAsyncRouters = routers
    },
    RESET_ROUTERS: (state) => {
      Object.assign(state, defaultState())
    }
  },

  actions: {
    generateRoutes({ commit }) {
      return new Promise((resolve, reject) => {
        validateAccessToken().then(() => {
          const accessedAsyncRouters = filterAsyncRouter(asyncRouters)
          commit('SET_ROUTERS', accessedAsyncRouters)
          resolve(accessedAsyncRouters)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

/**
 * 通过路由上的 meta.permission 判断是否与当前成员权限匹配
 * @param route
 */
function checkPermission(route) {
  // Usage:
  // default joint value is and:
  //     meta: { requiresAuth: true, permission: ['member:list'] }, if only one item => permission: 'member:list'
  //     meta: { requiresAuth: true, permission: { joint: 'and', list: ['member:list'] } }
  if (route.meta && route.meta.requiresAuth) {
    return permission.check({
      value: route.meta.permission,
      accessCallback: () => true,
      notAccessCallback: () => false
    })
  }
  return true
}

/**
 * 递归路由表，返回符合成员角色权限的路由表
 * @param asyncRouters
 */
function filterAsyncRouter(asyncRouters) {
  return asyncRouters.filter(route => {
    // console.debug('hasPermission(route)', hasPermission(route))
    // console.debug('route', route)
    if (!checkPermission(route)) {
      return false
    }
    if (route.children && route.children.length > 0) {
      // 如果这个路由下面还有下一级的话，递归调用
      route.children = filterAsyncRouter(route.children)
      return route.children && route.children.length > 0
    }
    return true
  })
}
