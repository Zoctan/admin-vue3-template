import axios from 'axios'
import router from '@/router'
import localStore from '@/utils/localStore'
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
        } else if (response.data.errno === 4002) {
            ElMessage.error('auth error, please login')
            router.push({ path: '/login' })
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
