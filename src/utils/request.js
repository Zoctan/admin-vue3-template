import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { ElMessage, ElLoading } from 'element-plus'

// refreshing token flag
let isRefreshing = false
// retry requests queue
let requests = []
// fullscreen loading instance
let loadingInstance = null
function retryAdapterEnhancer(adapter, options) {
    const { times = 1, delay = 3000 } = options
    return async (config) => {
        const { retryTimes = times, retryDelay = delay } = config
        let retryCount = 0
        const request = async () => {
            try {
                return await adapter(config)
            } catch (error) {
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

const getConfig = (config, accessToken) => {
    config.baseURL = import.meta.env.VITE_API_DOMAIN
    config.headers['Authorization'] = accessToken
    return config
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
    // will send preflight request (OPTIONS), needs back-end response correctly
    'Content-type': 'application/json;charset=UTF-8'
}

instance.interceptors.request.use(
    (config) => {
        loadingInstance = ElLoading.service({ fullscreen: true })
        const accessToken = store.getters.token && store.getters.token.accessToken ? store.getters.token.accessToken : ''
        config = getConfig(config, accessToken)
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    (response) => {
        if (response.data.errno === 0) {
            loadingInstance && loadingInstance.close()
            return Promise.resolve(response.data)
        } else if (response.data.errno === 4002) {
            const config = response.config
            const authErrorCallback = (error) => {
                store.dispatch('memberLogout')
                ElMessage.error(`auth error: ${error}, please login`)
                return router.push({ path: '/login' })
            }
            if (!isRefreshing) {
                isRefreshing = true
                const refreshToken = store.getters.token && store.getters.token.refreshToken ? store.getters.token.refreshToken : ''
                if (refreshToken === null || refreshToken === '') {
                    return authErrorCallback('empty refreshToken')
                } else {
                    ElMessage.info('refresh token, please wait...')
                    return store.dispatch('refreshToken', { refreshToken: refreshToken }).then((accessToken) => {
                        // already refreshed token, retry pending requests
                        requests.forEach(callback => callback(accessToken))
                        requests = []
                        return instance(getConfig(config, accessToken))
                    }).catch((error) => {
                        return authErrorCallback(error)
                    }).finally(() => {
                        isRefreshing = false
                        loadingInstance && loadingInstance.close()
                    })
                }
            } else {
                // pending requests when refreshing token
                return new Promise((resolve) => {
                    requests.push((accessToken) => {
                        resolve(instance(getConfig(config, accessToken)))
                    })
                })
            }
        } else {
            loadingInstance && loadingInstance.close()
            return Promise.reject(response.data)
        }
    },
    (error) => {
        loadingInstance && loadingInstance.close()
        // console.error('response error', error.response.data.msg)
        return Promise.reject(error)
    }
)

export default instance
