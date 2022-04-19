import { register, login, logout, profile } from 'api/member'

const defaultState = () => {
  return {
    member: null,
    memberData: null,
    roleList: [],
    permissionList: []
  }
}

export default {
  state: defaultState(),

  mutations: {
    SET_MEMBER: (state, _member) => {
      const { member, memberData, roleList, permissionList } = _member
      state.member = member
      state.memberData = memberData
      state.roleList = roleList
      state.permissionList = permissionList
    },
    RESET_MEMBER: (state) => {
      Object.assign(state, defaultState())
    }
  },

  actions: {
    memberLogin({ commit }, params) {
      return new Promise((resolve, reject) => {
        login(params)
          .then((response) => {
            commit('SET_TOKEN', response.data)
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    memberRegister({ commit }, params) {
      return new Promise((resolve, reject) => {
        register(params)
          .then((response) => {
            commit('SET_TOKEN', response.data)
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    memberProfile({ commit }) {
      return new Promise((resolve, reject) => {
        profile()
          .then((response) => {
            commit('SET_MEMBER', response.data)
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    memberLogout({ commit }) {
      return new Promise((resolve) => {
        logout().finally(() => {
          commit('RESET_MEMBER')
          commit('RESET_TOKEN')
          commit('RESET_ROUTERS')
          resolve()
        })
      })
    },
  }
}
