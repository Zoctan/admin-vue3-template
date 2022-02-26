import { authRouters, noAuthRouters } from '../../router'

/**
 * 通过路由上的 meta.auth 判断是否与当前用户权限匹配
 * @param ruleList
 * @param route
 */
function hasPermission(ruleList, route) {
  if (route.meta && route.meta.rule) {
    return ruleList.some(rule => route.meta.rule.indexOf(rule) >= 0)
  }
  return false
}

/**
 * 递归路由表，返回符合用户角色权限的路由表
 * @param authRouters
 * @param ruleList
 */
function filterAuthRouter(authRouters, ruleList) {
  return authRouters.filter(route => {
    if (hasPermission(ruleList, route)) {
      if (route.children && route.children.length) {
        // 如果这个路由下面还有下一级的话，递归调用
        route.children = filterAuthRouter(route.children, ruleList)
        // 如果过滤一圈后,没有子元素了，这个父级菜单就也不显示了
        // return (route.children && route.children.length)
      }
      return true
    }
    return false
  })
}

export default {
  state: {
    accessedRouters: noAuthRouters,
    accessedAuthRouters: []
  },

  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.accessedAuthRouters = routers
      // 路由合并，成为本用户最终可以访问的路由
      state.accessedRouters = state.accessedRouters.concat(routers)
    }
  },

  actions: {
    generateRoutes({ commit }, member) {
      return new Promise(resolve => {
        const ruleList = member.ruleList
        // 筛选出本角色可用的路由
        const accessedAuthRouters = filterAuthRouter(authRouters, ruleList)
        // 执行设置路由的方法
        commit('SET_ROUTERS', accessedAuthRouters)
        resolve()
      })
    }
  }
}
