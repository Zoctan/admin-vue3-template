// https://vuex.vuejs.org/zh/guide/getters.html
export default {
    sidebar: state => state.app.sidebar,

    token: state => state.member.token,
    member: state => state.member.member,

    routers: state => state.router.accessedRouters
}
