import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

// importing multiple modules from the file system: https://cn.vitejs.dev/guide/features.html#glob-import
const modules = import.meta.glob('/src/views/**/**.vue')
const _import = (file) => modules[`/src/views/${file}.vue`]
// console.debug('modules', modules)

export const constRouters = [
    { path: '/404', component: _import('error/404'), name: 'NotFound', meta: { hidden: true } },
    { path: '/401', component: _import('error/401'), name: 'NotAuth', meta: { hidden: true } },
    { path: '/', redirect: '/dashboard', meta: { hidden: true } },
    {
        path: '/dashboard',
        component: Layout,
        name: 'Dashboard',
        meta: { icon: 'house', auth: true, },
        children: [{
            path: '',
            // dont't use repeat name
            // who use repeat name first, it will render the first one, and doesn't render the other component
            name: 'DashboardX',
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
        path: '/nestedMenu',
        component: Layout,
        name: 'Nested Menu',
        meta: { icon: 'menu', dropDown: true, },
        children: [{
            path: '11',
            name: '11',
            component: _import('nestedMenu/11'),
            meta: { icon: 'menu' }
        }, {
            path: '12',
            name: '12',
            // use empty.vue to be a children placeholder
            component: _import('empty'),
            meta: { icon: 'menu', dropDown: true, },
            children: [{
                path: '12-21',
                name: '12-21',
                component: _import('nestedMenu/12-21'),
                meta: { icon: 'menu' }
            }, {
                path: '12-22',
                name: '12-22',
                component: _import('nestedMenu/12-22'),
                meta: { icon: 'menu' }
            }, {
                path: '12-23',
                name: '12-23',
                component: _import('empty'),
                meta: { icon: 'menu', dropDown: true, },
                children: [{
                    path: '12-23-31',
                    name: '12-23-31',
                    component: _import('nestedMenu/12-23-31'),
                    meta: { icon: 'menu' }
                },
                {
                    path: '12-23-32',
                    name: '12-23-32',
                    component: _import('nestedMenu/12-23-32'),
                    meta: { icon: 'menu' }
                }]
            },]
        },],
    },
]

export const asyncRouters = [
    {
        path: '/member',
        component: Layout,
        name: 'Member',
        meta: { icon: 'user', dropDown: true, },
        children: [{
            path: 'profile',
            name: 'Member Profile',
            component: _import('member/profile'),
            meta: { hidden: true, auth: true }
        }, {
            path: 'list',
            name: 'Member Manage',
            component: _import('member/list'),
            meta: { icon: 'user', auth: true, permission: ['member:list'] }
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
            meta: { icon: 'user-filled', auth: true, permission: ['role:list'] }
        }]
    },
    {
        path: '/imageUpload',
        component: Layout,
        name: 'Image Upload',
        meta: { icon: 'upload', auth: true },
        children: [{
            path: 'add',
            name: 'Image UploadX',
            component: _import('imageUpload/add'),
        }]
    },
    {
        path: '/pair',
        component: Layout,
        name: 'Pair',
        meta: { icon: 'setting', auth: true, permission: ['pair:list'] },
        children: [{
            path: 'list',
            name: 'PairX',
            component: _import('pair/list'),
        }]
    },
    {
        path: '/log',
        component: Layout,
        name: 'Log',
        meta: { icon: 'document', auth: true, permission: ['log:list'] },
        children: [{
            path: 'list',
            name: 'LogX',
            component: _import('log/list'),
        }]
    },
]

const defaultRouter = () => createRouter({
    /**
     * History modes: https://router.vuejs.org/zh/guide/essentials/history-mode.html
     * Hash Mode: createWebHashHistory
     * HTML5 Mode: createWebHistory
     */
    history: createWebHistory(),
    routes: constRouters,
    /**
     * Scroll behavior: https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html
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
            // always scroll to top
            return {
                top: 0,
                behavior: 'smooth',
            }
        }
    },
})

const router = defaultRouter()

export default router