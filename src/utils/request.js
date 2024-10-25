import axios from 'axios'
import {ElMessage} from "element-plus";
import {router} from "@/router/index.js";


const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API,
    timeout: 3000,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use(config => {
    if (config.url !== '/user/login') {
        config.headers.Authorization = localStorage.getItem('token')
    }
    return config
}, err => {
    Promise.reject(err)
})

api.interceptors.response.use(res => {
    if (res['data']['code'] === 0) {
        return res.data
    }
    //  已在别处登录
    if (res['data']['code'] === 1) {
        localStorage.removeItem('token')
        router.push({name: 'login'})
    }
    ElMessage.error(res['data']['msg'])
}, err => {
    let {res} = err
    if (res) {
    } else {
        if (!window.navigator.onLine) {
            return
        }
    }
    return Promise.reject(err)
})
export default api
