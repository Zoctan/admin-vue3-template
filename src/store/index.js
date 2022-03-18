import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import state from './state'
import getters from './getters'
import actions from './actions'
import mutations from './mutations'
import app from './modules/app'
import member from './modules/member'
import token from './modules/token'
import router from './modules/router'

export default createStore({
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions,
    modules: {
        app,
        member,
        token,
        router,
    },
    plugins: [createPersistedState({
        key: 'vuex',
        storage: window.localStorage,
    })]
})
