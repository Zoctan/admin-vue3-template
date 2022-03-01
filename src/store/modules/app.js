export default {
  state: {
    sidebar: {
      opened: true
    }
  },

  mutations: {
    TOGGLE_SIDEBAR: (state) => {
      state.sidebar.opened = !state.sidebar.opened
      console.debug('state.sidebar',state.sidebar)
    }
  },
  
  actions: {
    toggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    }
  }
}
