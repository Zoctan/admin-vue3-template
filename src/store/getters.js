// https://vuex.vuejs.org/zh/guide/getters.html
export default {
    sidebar: state => state.app.sidebar,

    member: state => state.member,

    routers: state => state.router.accessedRouters,
    addRouters: state => state.router.accessedAsyncRouters
}
