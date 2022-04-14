import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { ElMessage, ElLoading } from 'element-plus'

// refreshing token flag
let isRefreshing = false
let refreshSuccess = false
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

const setGetConfig = (config) => {
    config.baseURL = import.meta.env.VITE_API_DOMAIN
    const accessToken = store.getters.token && store.getters.token.accessToken ? store.getters.token.accessToken : ''
    config.headers['Authorization'] = accessToken
    return config
}

const instance = axios.create({
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
        return setGetConfig(config)
    },
    (error) => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    (response) => {
        loadingInstance && loadingInstance.close()
        if (response.data.errno === 0) {
            return Promise.resolve(response.data)
        } else {
            const authErrorCallback = async (error) => {
                await store.dispatch('memberLogout')
                ElMessage.error(`${error}, please login`)
                router.push({ path: '/login' })
                return Promise.reject(response.data)
            }
            if (response.data.errno === 4001) {
                console.error('token error:', response.data.msg)
                return authErrorCallback(response.msg)
            } else if (response.data.errno === 4002) {
                console.error('access token error, msg:', response.data.msg)
                console.error('access token error, requests:', requests)
                console.error('access token error, isRefreshing:', isRefreshing)
                const config = response.config
                if (!isRefreshing) {
                    const refreshToken = store.getters.token && store.getters.token.refreshToken ? store.getters.token.refreshToken : ''
                    if (refreshToken === null || refreshToken === '') {
                        return authErrorCallback('empty refreshToken')
                    }

                    console.debug('refresh token, please wait...')
                    ElMessage.info('refresh token, please wait...')

                    isRefreshing = true
                    return store.dispatch('refreshToken', { refreshToken: refreshToken }).then(() => {
                        ElMessage.success('refresh token success, retry pending requests...')
                        console.debug('refresh token success, requests:', requests)
                        isRefreshing = false
                        refreshSuccess = true
                    }).catch((error) => {
                        isRefreshing = false
                        refreshSuccess = false
                        console.error('refresh token error:', error)
                        return authErrorCallback(error)
                    }).finally(() => {
                        if (refreshSuccess === true) {
                            // already refreshed token, retry pending requests
                            // don't put below code into above 'refreshToken' then()
                            // because if instace() return Promise.reject()
                            // that will be catched by above 'refreshToken' catch() and call authErrorCallback()
                            requests.forEach(callback => callback())
                            requests = []
                            return instance(setGetConfig(config))
                        }
                    })
                } else {
                    // pending requests when refreshing token
                    return new Promise((resolve) => {
                        requests.push(() => {
                            resolve(instance(setGetConfig(config)))
                        })
                    })
                }
            } else if (response.data.errno === 4003) {
                console.error('refresh token error:', response.data.msg)
                return authErrorCallback(response.msg)
            } else {
                console.error('response errno !== 0', response.data.msg)
                return Promise.reject(response.data)
            }
        }
    },
    (error) => {
        loadingInstance && loadingInstance.close()
        console.error('response error', error.response.data.msg)
        return Promise.reject(error)
    }
)

export default instance
