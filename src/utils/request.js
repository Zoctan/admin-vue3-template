import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { ElMessage } from 'element-plus'

function retryAdapterEnhancer(adapter, options) {
    const { times = 1, delay = 3000 } = options
    return async (config) => {
        const { retryTimes = times, retryDelay = delay } = config
        let retryCount = 0
        const request = async () => {
            try {
                return await adapter(config)
            } catch (error) {
                // Only retry once
                if (!retryTimes || retryCount >= retryTimes) {
                    return Promise.reject(error)
                }
                retryCount += 1
                // delay process
                const delayFunc = new Promise((resolve) => {
                    setTimeout(() => resolve(), retryDelay)
                })
                // send the request again
                return delayFunc.then(() => request())
            }
        }
        return request()
    }
}

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_DOMAIN,
    withCredentials: false,
    timeout: 5000,
    adapter: retryAdapterEnhancer(axios.defaults.adapter, {
        retryDelay: 1000,
    }),
})

instance.defaults.headers.post = {
    // 请求以 JSON 形式传送
    // 会有预检请求，服务端需要正常通过OPTIONS请求
    'Content-type': 'application/json;charset=UTF-8'
}

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
instance.interceptors.response.use(
    (response) => {
        if (response.data.errno === 0) {
            return Promise.resolve(response.data)
        } else if (response.data.errno === 4002) {
            const authErrorCallback = () => {
                store.dispatch('memberLogout')
                ElMessage.error('auth error, please login')
                return router.push({ path: '/login' })
            }
            const config = response.config
            if (!isRefreshing) {
                isRefreshing = true
                const refreshToken = store.getters.token && store.getters.token.refreshToken ? store.getters.token.refreshToken : ''
                if (refreshToken === null || refreshToken === '') {
                    return authErrorCallback()
                } else {
                    return store.dispatch('refreshToken', { refreshToken: refreshToken }).then((response) => {
                        const { accessToken } = response.data
                        config.baseURL = ''
                        config.headers['Authorization'] = accessToken
                        // 已经刷新了token，将所有队列中的请求进行重试
                        requests.forEach(callback => callback(accessToken))
                        requests = []
                        return instance(config)
                    }).catch((error) => {
                        return authErrorCallback()
                    }).finally(() => {
                        isRefreshing = false
                    })
                }
            } else {
                return new Promise((resolve) => {
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
        // ElMessage.error(error.response.data.msg)
        return Promise.reject(error)
    }
)

export default instance
