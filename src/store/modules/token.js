import { refreshToken } from '@/api/member'

const defaultState = () => {
  return {
    token: null,
    // expire minutes
    expired: null,
    // rest minutes
    rest: null,
  }
}

export default {
  state: defaultState(),

  mutations: {
    SET_TOKEN: (state, _token) => {
      const { token, expired } = _token
      state.token = token
      state.expired = expired
      state.rest = expired
    },
    RESET_TOKEN: (state) => {
      Object.assign(state, defaultState())
    },
    START_TOKEN_CLOCK(state, timer) {
      if (state.rest && state.rest != 0) {
        state.rest--
        console.debug('token clock => ', state.rest)
      } else {
        console.debug('clear token clock')
        clearInterval(timer)
      }
    }
  },

  actions: {
    // start token expired clock, if rest time less than target minutes, refresh token
    startTokenClock({ commit }) {
      console.debug('start token clock')
      const timer = setInterval(function () {
        commit('START_TOKEN_CLOCK', timer)
      }, 1000 * 60)
    },
    refresh({ commit }) {
      console.debug('refresh token')
      return new Promise((resolve, reject) => {
        refreshToken().then(response => {
          commit('SET_TOKEN', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },
  }
}
