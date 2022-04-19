import { refreshAccessToken as refreshAccessTokenApi } from 'api/member'

const defaultState = () => {
  return {
    accessToken: null,
    refreshToken: null,
  }
}

export default {
  state: defaultState(),

  mutations: {
    SET_ACCESS_TOKEN: (state, accessToken) => {
      state.accessToken = accessToken
    },
    SET_REFRESH_TOKEN: (state, refreshToken) => {
      state.refreshToken = refreshToken
    },
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
    refreshAccessToken({ commit }, data) {
      return new Promise((resolve, reject) => {
        refreshAccessTokenApi(data)
          .then((response) => {
            commit('SET_ACCESS_TOKEN', response.data)
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
  }
}
