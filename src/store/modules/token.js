import { refreshToken as refreshTokenApi } from '@/api/member'

const defaultState = () => {
  return {
    accessToken: null,
    refreshToken: null,
  }
}

export default {
  state: defaultState(),

  mutations: {
    SET_TOKEN: (state, _token) => {
      const { accessToken, refreshToken } = _token
      state.accessToken = accessToken
      state.refreshToken = refreshToken
    },
    RESET_TOKEN: (state) => {
      Object.assign(state, defaultState())
    },
  },

  actions: {
    refreshToken({ commit }, data) {
      return new Promise((resolve, reject) => {
        refreshTokenApi(data).then(response => {
          commit('SET_TOKEN', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },
  }
}