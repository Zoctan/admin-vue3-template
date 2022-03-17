// https://vuex.vuejs.org/zh/guide/getters.html
export default {
    sidebarOpened: state => state.app.sidebarOpened,

    member: state => state.member,
    token: state => state.token,

    accessedRouters: state => state.router.accessedRouters,
    accessedAsyncRouters: state => state.router.accessedAsyncRouters
}
