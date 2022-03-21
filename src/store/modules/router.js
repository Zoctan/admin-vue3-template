import { constRouters, asyncRouters } from '@/router'

let permissionList = []

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
    generateRoutes({ commit }, member) {
      return new Promise(resolve => {
        permissionList = member.permissionList
        // console.debug('permissionList', permissionList)
        const accessedAsyncRouters = filterAsyncRouter(asyncRouters)
        commit('SET_ROUTERS', accessedAsyncRouters)
        resolve(accessedAsyncRouters)
      })
    }
  }
}

/**
 * 通过路由上的 meta.auth 判断是否与当前成员权限匹配
 * @param route
 */
function hasPermission(route) {
  // meta: { requiresAuth: true, auth: ['member:list'] }
  // meta: { requiresAuth: true, auth: { joint: 'and', list: ['member:list'] } }
  if (route.meta && route.meta.requiresAuth) {
    if (route.meta.auth) {
      if (permissionList.length === 0) {
        return false
      } else {
        if (route.meta.auth instanceof Array && route.meta.auth.length > 0) {
          return checkPermission(route.meta.auth)
        } else if (route.meta.auth instanceof Object) {
          const { joint, list } = route.meta.auth
          if (list.length > 0) {
            return checkPermission(list, joint)
          }
        } else {
          return false
        }
      }
    }
  }
  return true
}

function checkPermission(needList = [], joint = 'and') {
  const needSet = new Set(needList)
  const permissionSet = new Set(permissionList)
  const intersect = new Set([...needSet].filter(x => permissionSet.has(x)))
  if (joint === 'and') {
    const setsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))
    return setsEqual(needSet, intersect)
  } else if (joint === 'or') {
    return intersect.size > 0
  }
  return false
}


/**
 * 递归路由表，返回符合成员角色权限的路由表
 * @param asyncRouters
 */
function filterAsyncRouter(asyncRouters) {
  return asyncRouters.filter(route => {
    // console.debug('hasPermission(route)', hasPermission(route))
    // console.debug('route', route)
    if (!hasPermission(route)) {
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
