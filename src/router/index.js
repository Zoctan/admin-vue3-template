import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

// 使用 Glob 动态引入：https://cn.vitejs.dev/guide/features.html#glob-import
const modules = import.meta.glob('/src/views/**/**.vue')
const _import = (file) => modules[`/src/views/${file}.vue`]
// console.debug('modules', modules)

export const constRouters = [
    { path: '/:allMatch(.*)*', redirect: '/404', meta: { hidden: true } },
    { path: '/404', component: _import('error/404'), meta: { hidden: true } },
    { path: '/401', component: _import('error/401'), meta: { hidden: true } },
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
        path: '/login',
        name: 'Login',
        component: _import('member/login'),
        meta: { hidden: true },
        props: route => ({ redirect: route.query.redirect })
    },
    {
        path: '/register',
        name: 'Register',
        component: _import('member/register'),
        meta: { hidden: true },
        props: route => ({ redirect: route.query.redirect })
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
            props: true,
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

const defaultRouter = () => createRouter({
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

const router = defaultRouter()

export default router