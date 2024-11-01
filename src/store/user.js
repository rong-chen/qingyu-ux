import {defineStore} from "pinia";
import {useRouter} from "vue-router";
import {ref} from "vue";
import {GetUserInfo, Login} from "@/api/user.js";
import {ElMessage} from "element-plus";

export const userStore = defineStore('userStore', () => {
    const router = useRouter()
    let userInfo = ref({
        ID: ''
    })
    let token = ref("")
    const LoginEvent = async (form) => {
        const res = await Login(form)
        if (res.code === 0) {
            let data = res.token
            localStorage.setItem('token', data)
            ElMessage.success("登录成功")
            token.value = data
            await router.push({
                name: "home",
            })
        }
    }
    return {
        userInfo, LoginEvent, token
    }
})
