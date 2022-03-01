import axios from 'axios'
import router from '@/router'
import localStore from '@/utils/localStore'

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

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        config.headers['Authorization'] = localStore() && localStore().member.token || ''
        return config
    },
    (error) => {
        console.debug(error)
        return Promise.reject(error)
    }
)

// 响应拦截器
instance.interceptors.response.use(
    (response) => {
        if (response.data.errno === 0) {
            return Promise.resolve(response.data)
        } else {
            ElNotification({
                title: '错误',
                message: response.data.msg,
                type: 'error',
            })
            return Promise.reject('响应数据不正确')
        }
    },
    (error) => {
        if (error.response.data.errno === 4002) {
            ElNotification({
                title: '错误',
                message: '认证异常，请重新登录！',
                type: 'error',
            })
            router.push({ path: '/login' })
        } else {
            ElNotification({
                title: '错误',
                message: error.response.data.msg,
                type: 'error',
            })
        }
        return Promise.reject(error)
    }
)

export default instance
