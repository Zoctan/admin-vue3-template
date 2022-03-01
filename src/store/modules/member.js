import { login, logout, profile } from '@/api/member'

const defaultMember = {
  id: -1,
  name: null,
  roleId: -1,
  roleName: null,
  permissionList: []
}

export default {
  state: {
    token: null,
    member: defaultMember
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_MEMBER: (state, member) => {
      state.member = member
    },
    RESET_MEMBER: (state) => {
      state.member = defaultMember
    }
  },

  actions: {
    memberLogin({ commit }, params) {
      return new Promise((resolve, reject) => {
        login(params).then(response => {
          if (response.code === 200) {
            commit('SET_TOKEN', response.data)
            return resolve(response)
          }
          reject()
        }).catch(error => {
          reject(error)
        })
      })
    },
    memberProfile({ commit }) {
      return new Promise((resolve, reject) => {
        profile().then(response => {
          commit('SET_MEMBER', response.data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    memberLogout({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          commit('RESET_MEMBER')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
  }
}
