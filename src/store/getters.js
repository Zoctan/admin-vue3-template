// https://vuex.vuejs.org/zh/guide/getters.html
export default {
    sidebarOpened: state => state.app.sidebarOpened,

    member: state => state.member,

    routers: state => state.router.accessedRouters,
    addRouters: state => state.router.accessedAsyncRouters
}
