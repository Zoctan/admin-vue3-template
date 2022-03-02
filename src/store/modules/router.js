import { constRouters, asyncRouters, resetRouter } from '@/router'

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
      state.accessedAsyncRouters = routers
      // 路由合并，成为本成员最终可以访问的路由
      state.accessedRouters = constRouters.concat(routers)
    },
    RESET_ROUTERS: (state) => {
      Object.assign(state, defaultState())
      resetRouter()
    }
  },

  actions: {
    generateRoutes({ commit }, member) {
      return new Promise(resolve => {
        const permissionList = member.permissionList
        const accessedAsyncRouters = filterAsyncRouter(asyncRouters, permissionList)
        commit('SET_ROUTERS', accessedAsyncRouters)
        resolve(accessedAsyncRouters)
      })
    }
  }
}

/**
 * 通过路由上的 meta.auth 判断是否与当前成员权限匹配
 * @param permissionList
 * @param route
 */
function hasPermission(permissionList, route) {
  if (route.meta && route.meta.requiresAuth && route.meta.auth) {
    return permissionList.some(permission => route.meta.auth.includes(permission))
  }
  return true
}

/**
 * 递归路由表，返回符合成员角色权限的路由表
 * @param asyncRouters
 * @param permissionList
 */
function filterAsyncRouter(asyncRouters, permissionList) {
  return asyncRouters.filter(route => {
    // console.debug('permissionList', permissionList)
    // console.debug('route', route)
    if (hasPermission(permissionList, route)) {
      if (route.children && route.children.length > 0) {
        // 如果这个路由下面还有下一级的话，递归调用
        route.children = filterAsyncRouter(route.children, permissionList)
        // 如果过滤一圈后，没有子元素，这个父级菜单也不显示了
        return (route.children && route.children.length)
      }
      return true
    }
    return false
  })
}
