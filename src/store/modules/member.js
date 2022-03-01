import { login, logout, profile } from '@/api/member'

const defaultState = () => {
  return {
    token: null,
    memberData: null,
    role: null,
    permissionList: []
  }
}

export default {
  state: defaultState(),

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_MEMBER: (state, member) => {
      const { memberData, role, permissionList } = member
      state.memberData = memberData
      state.role = role
      state.permissionList = permissionList
    },
    RESET_MEMBER: (state) => {
      Object.assign(state, defaultState())
    }
  },

  actions: {
    memberLogin({ commit }, params) {
      return new Promise((resolve, reject) => {
        login(params).then(response => {
          commit('SET_TOKEN', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    memberProfile({ commit }) {
      return new Promise((resolve, reject) => {
        profile().then(response => {
          commit('SET_MEMBER', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    memberLogout({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          commit('RESET_MEMBER')
          commit('RESET_ROUTERS')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
  }
}
