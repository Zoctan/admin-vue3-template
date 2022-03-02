export default {
  state: {
    sidebarOpened: true
  },

  mutations: {
    TOGGLE_SIDEBAR: (state) => {
      state.sidebarOpened = !state.sidebarOpened
    }
  },
  
  actions: {
    toggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    }
  }
}
