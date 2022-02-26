import { login, logout, detail } from '@/api/member'

const defaultMember = {
  id: -1,
  name: null,
  roleName: null,
  ruleList: []
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
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    memberDetail({ commit }) {
      return new Promise((resolve, reject) => {
        detail().then(response => {
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
