import { createRouter, createWebHistory, isNavigationFailure } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Layout from '@/layout/index.vue'
import localStore from '@/utils/localStore'
import hasPermission from '@/utils/hasPermission'
import { ElMessage } from 'element-plus'
import store from '@/store'

// 使用 Glob 动态引入：https://cn.vitejs.dev/guide/features.html#glob-import
const modules = import.meta.glob('/src/views/**/**.vue')
const _import = (file) => modules[`/src/views/${file}.vue`]
// console.debug('modules', modules)

export const constRouters = [
    // { path: '/:allMatch(.*)*', redirect: '/404', meta: { hidden: true } },
    { path: '/404', component: _import('error/404'), meta: { hidden: true } },
    { path: '/401', component: _import('error/401'), meta: { hidden: true } },
    { path: '/login', name: 'Login', component: _import('member/login'), meta: { hidden: true } },
    { path: '/register', name: 'Register', component: _import('member/register'), meta: { hidden: true } },
    { path: '/', redirect: '/dashboard', meta: { hidden: true } },
    {
        path: '/dashboard',
        component: Layout,
        name: 'Dashboard',
        meta: { icon: 'house', requiresAuth: true, },
        children: [{
            path: '',
            component: _import('dashboard')
        }],
    },
    {
        path: '/test',
        component: Layout,
        name: 'Test',
        meta: { icon: 'sunny', dropDown: true, },
        children: [{
            path: 'sub1',
            name: 'Test Sub 1',
            icon: 'soccer',
            component: _import('testSub1'),
            meta: { icon: 'soccer' }
        }, {
            path: 'sub2',
            name: 'Test Sub 2',
            component: _import('testSub2'),
            meta: { icon: 'star' }
        }],
    },
]

export const asyncRouters = [
    {
        path: '/member',
        component: Layout,
        name: 'Member',
        meta: { icon: 'user', dropDown: true, },
        children: [{
            path: 'list',
            name: 'Member Manage',
            component: _import('member/list'),
            meta: { icon: 'user', requiresAuth: true, auth: ['member:list'] }
        }, {
            path: 'detail/:id',
            name: 'Member Detail',
            component: _import('member/detail'),
            meta: { hidden: true, requiresAuth: true, auth: ['member:detail'] }
        }, {
            path: 'profile',
            name: 'Member Profile',
            component: _import('member/profile'),
            meta: { hidden: true, requiresAuth: true }
        },]
    },
    {
        path: '/role',
        component: Layout,
        name: 'Role',
        meta: { icon: 'user-filled', dropDown: true, },
        children: [{
            path: 'list',
            name: 'Role Manage',
            component: _import('role/list'),
            meta: { icon: 'user-filled', requiresAuth: true, auth: ['role:list'] }
        }]
    }
]

const router = createRouter({
    /**
     * 历史模式：https://router.vuejs.org/zh/guide/essentials/history-mode.html
     * Hash 模式：createWebHashHistory
     * HTML5 模式（推荐）：createWebHistory
     */
    history: createWebHistory(),
    routes: constRouters,
    /**
     * 滚动行为：使用前端路由，当切换到新路由时，想要页面滚到顶部，或者是保持原先的滚动位置，就像重新加载页面那样。
     * https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html
     * 
     * @param {*} to 
     * @param {*} from 
     * @param {*} savedPosition 
     * @returns 
     */
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            // 滚动到顶部
            return {
                top: 0,
                behavior: 'smooth',
            }
        }
    },
})

// 挂载动态路由表
let addAsyncRoutersFlag = false
const addAsyncRouters = async () => {
    // if (!addAsyncRoutersFlag) {
    //     const accessedAsyncRouters = await store.dispatch('generateRoutes', localStore().member)
    //     accessedAsyncRouters.forEach(item => {
    //         router.addRoute(item)
    //     })
    //     addAsyncRoutersFlag = true
    // }
    console.debug('store', store)
    if (!addAsyncRoutersFlag && localStore() && localStore().router.accessedAsyncRouters) {
        localStore().router.accessedAsyncRouters.forEach(item => {
            router.addRoute(item)
        })
        addAsyncRoutersFlag = true
    }
}
addAsyncRouters()

// 导航守卫：https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
// 顺序：beforeEach -> beforeResolve -> afterEach
// 有无 token：
//   有：
//     前往的路径无需认证 和 权限：直接前往
//     前往的路径需要认证 和 权限：
//                           需要认证，但不需要权限：直接前往
//                           需要权限：检查权限
//   无：
//     前往的路径无需认证 和 权限：直接前往
//     前往的路径需要认证 和 权限：跳到登录页
router.beforeEach(async (to, from, next) => {
    NProgress.start()
    console.debug('addAsyncRoutersFlag', addAsyncRoutersFlag)
    console.debug('to', to)
    console.debug('routers', router.getRoutes())
    if (localStore() && localStore().member.token) {
        if (!addAsyncRoutersFlag) {
            const accessedAsyncRouters = await store.dispatch('generateRoutes', localStore().member)
            accessedAsyncRouters.forEach(item => {
                router.addRoute(item)
            })
            addAsyncRoutersFlag = true
        }
        // 无需认证 和 权限
        if (!to.meta.requiresAuth && !to.meta.auth) {
            next()
        } else {
            // 不要重复访问登录页
            if (to.path === '/login') {
                next({ path: '/' })
            } else {
                if (to.meta.requiresAuth && !to.meta.auth) {
                    next()
                } else if (to.meta.requiresAuth && to.meta.auth && hasPermission(to.meta.auth)) {
                    next()
                } else {
                    ElMessage.error(`no permission to visit ${to.path}`)
                }
            }
        }
    } else {
        if (!to.meta.requiresAuth && !to.meta.auth) {
            next()
        } else {
            next({ path: '/login' })
        }
    }
})

router.beforeResolve(async (to, from, next) => {
    next()
})

router.afterEach((to, from, failure) => {
    if (isNavigationFailure(failure)) {
        console.log('failed navigation', failure)
    }
    NProgress.done()
})

export default router