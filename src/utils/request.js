import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_DOMAIN,
    withCredentials: false,
    // 请求超时时间
    timeout: 5000,
})

instance.defaults.headers.post = {
    // 请求以 JSON 形式传送
    // 会有预检请求，服务端需要正常通过OPTIONS请求
    'Content-type': 'application/json;charset=UTF-8'
}

// request interceptor
instance.interceptors.request.use(
    (config) => {
        config.headers['Authorization'] = store.getters.token && store.getters.token.accessToken ? store.getters.token.accessToken : ''
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 是否正在刷新的标记
let isRefreshing = false
// 重试队列，每一项将是一个待执行的函数形式
let requests = []
// response interceptor
instance.interceptors.response.use(
    (response) => {
        if (response.data.errno === 0) {
            return Promise.resolve(response.data)
        } else if (response.data.errno === 4002) {
            const config = response.config
            if (!isRefreshing) {
                isRefreshing = true
                return store.dispatch('refreshToken').then((response) => {
                    const { accessToken } = response.data
                    config.baseURL = ''
                    config.headers['Authorization'] = accessToken
                    // 已经刷新了token，将所有队列中的请求进行重试
                    requests.forEach(callback => callback(accessToken))
                    requests = []
                    return instance(config)
                }).catch((error) => {
                    ElMessage.error('auth error, please login')
                    return router.push({ path: '/login' })
                }).finally(() => {
                    isRefreshing = false
                })
            } else {
                // 正在刷新token，将返回一个未执行resolve的promise
                return new Promise((resolve) => {
                    // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
                    requests.push((accessToken) => {
                        config.baseURL = ''
                        config.headers['Authorization'] = accessToken
                        resolve(instance(config))
                    })
                })
            }
        } else {
            return Promise.reject(response.data)
        }
    },
    (error) => {
        ElMessage.error(error.response.data.msg)
        return Promise.reject(error)
    }
)

export default instance
