import { createRouter, createWebHistory, isNavigationFailure } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Layout from '@/layout/index.vue'
import localStore from '@/utils/localStore'
import hasPermission from '@/utils/hasPermission'

// 使用 Glob 动态引入：https://cn.vitejs.dev/guide/features.html#glob-import
const modules = import.meta.glob('/src/views/**/**.vue')
const _import = (file) => modules[`/src/views/${file}.vue`]
// console.debug('modules', modules)

export const constRouters = [
    { path: '/:allMatch(.*)*', redirect: '/404', meta: { hidden: true } },
    { path: '/404', component: _import('error/404'), meta: { hidden: true } },
    { path: '/401', component: _import('error/401'), meta: { hidden: true } },
    { path: '/login', name: '登录', component: _import('Login'), meta: { hidden: true } },
    { path: '/register', name: '注册', component: _import('Register'), meta: { hidden: true } },
    { path: '/', redirect: '/dashboard', meta: { hidden: true } },
    {
        path: '/dashboard',
        component: Layout,
        name: '控制台',
        meta: { icon: 'house', requiresAuth: true, },
        children: [{
            path: '',
            component: _import('Dashboard')
        }],
    },
    {
        path: '/test',
        component: Layout,
        name: '测试',
        meta: { icon: 'sunny', dropDown: true, },
        children: [{
            path: 'sub1',
            name: '测试子页面1',
            icon: 'soccer',
            meta: { icon: 'soccer' },
            component: _import('TestSub1')
        }, {
            path: 'sub2',
            name: '测试子页面2',
            meta: { icon: 'star' },
            component: _import('TestSub2')
        }],
    },
]

export const asyncRouters = [
    {
        path: '/member',
        component: Layout,
        name: '成员',
        meta: { icon: 'user', dropDown: true, },
        children: [{
            path: 'list',
            name: '成员管理',
            component: _import('Member/List'),
            meta: { icon: 'user', requiresAuth: true, auth: ['member:list'] }
        }, {
            path: 'detail/:id',
            name: '成员信息',
            component: _import('Member/Detail'),
            meta: { icon: 'user', requiresAuth: true, auth: ['member:detail'] }
        }, {
            path: 'profile',
            name: '个人中心',
            component: _import('Member/Profile'),
            meta: { icon: 'avatar', requiresAuth: true, hidden: true }
        },]
    },
    {
        path: '/role',
        component: Layout,
        name: '角色',
        meta: { icon: 'user-filled', dropDown: true, },
        children: [{
            path: 'list',
            name: '角色管理',
            component: _import('Role/List'),
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

// 导航守卫：https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
// 顺序：beforeEach -> beforeResolve -> afterEach
// 1. 前往的路径无需认证：直接前往
// 2. 前往的路径需要认证：
//    有无 token：
//      有：检查权限
//      无：跳到登录页
router.beforeEach((to, from, next) => {
    NProgress.start()
    if (!to.meta.requiresAuth) {
        // 前往的路径无需认证，直接前往
        next()
    } else {
        // 需要认证
        if (localStore() && localStore().member.token) {
            // 检查权限
            if (!to.meta.auth) {
                next()
            } else {
                // 不要重复访问登录页
                if (to.path === '/login') {
                    next({ path: '/' })
                } else {
                    if (hasPermission(to.meta.auth)) {
                        next()
                    } else {
                        ElNotification({
                            title: '错误',
                            message: '无权访问该路径',
                            type: 'error',
                        })
                    }
                }
            }
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