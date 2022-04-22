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
      // Combine routes that this member can access
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
        validateAccessToken()
          .then(() => {
            const accessedAsyncRouters = filterAsyncRouter(asyncRouters)
            commit('SET_ROUTERS', accessedAsyncRouters)
            resolve(accessedAsyncRouters)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  }
}

/**
 * Determine whether it matches the current member permissions through the meta.permission on the route
 * 
 * @param route
 */
function checkPermission(route) {
  // Usage:
  // default joint value is and:
  //     meta: { auth: true, permission: ['member:list'] }, if only one item => permission: 'member:list'
  //     meta: { auth: true, permission: { joint: 'and', list: ['member:list'] } }
  if (route.meta && route.meta.auth) {
    return permission.check({
      value: route.meta.permission,
      accessCallback: () => true,
      notAccessCallback: () => false
    })
  }
  return true
}

/**
 * Recursive routing table, return routing table that conforms to member role permissions
 * 
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
      // If there is a next level below this route, recursively call
      route.children = filterAsyncRouter(route.children)
      return route.children && route.children.length > 0
    }
    return true
  })
}
