import { asyncRouters, constRouters } from '../../router'

/**
 * 通过路由上的 meta.auth 判断是否与当前用户权限匹配
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
 * 递归路由表，返回符合用户角色权限的路由表
 * @param asyncRouters
 * @param permissionList
 */
function filterAsyncRouter(asyncRouters, permissionList) {
  return asyncRouters.filter(route => {
    console.debug('permissionList', permissionList)
    console.debug('route', route)
    if (hasPermission(permissionList, route)) {
      if (route.children && route.children.length > 0) {
        // 如果这个路由下面还有下一级的话，递归调用
        route.children = filterAsyncRouter(route.children, permissionList)
        // 如果过滤一圈后,没有子元素了，这个父级菜单就也不显示了
        // return (route.children && route.children.length)
      }
      return true
    }
    return false
  })
}

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
      // 路由合并，成为本用户最终可以访问的路由
      state.accessedRouters = state.accessedRouters.concat(routers)
    },
    RESET_ROUTERS: (state) => {
      Object.assign(state, defaultState())
    }
  },

  actions: {
    generateRoutes({ commit }, member) {
      return new Promise(resolve => {
        const permissionList = member.permissionList
        // 筛选出本角色可用的路由
        const accessedAsyncRouters = filterAsyncRouter(asyncRouters, permissionList)
        // 执行设置路由的方法
        commit('SET_ROUTERS', accessedAsyncRouters)
        resolve()
      })
    }
  }
}
