export default {
  state: {
    sidebar: {
      opened: true
    }
  },

  mutations: {
    OPEN_SIDEBAR: (state) => {
      state.sidebar.opened = true
    },
    CLOSED_SIDEBAR: (state) => {
      state.sidebar.opened = false
    },
    TOGGLE_SIDEBAR: (state) => {
      state.sidebar.opened = !state.sidebar.opened
    }
  },
  
  actions: {
    toggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    }
  }
}
