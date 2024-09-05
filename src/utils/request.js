import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
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
    return res.data
}, err => {
    let {res} = err
    if (res) {
        switch (res.status) {
            case 401:
                break
            case 403:
                break
            case 404:
                break
            case 500:
                break
        }
    } else {
        if (!window.navigator.onLine) {
            return
        }
    }
    return Promise.reject(err)
})
export default api
