// https://vuex.vuejs.org/zh/guide/getters.html
export default {
    sidebarOpened: state => state.app.sidebarOpened,

    member: state => state.member,

    accessedRouters: state => state.router.accessedRouters,
    accessedAsyncRouters: state => state.router.accessedAsyncRouters
}
