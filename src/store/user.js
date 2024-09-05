import {defineStore} from "pinia";
import {useRouter} from "vue-router";
import {ref} from "vue";

export const userStore = defineStore('userStore', () => {
    const router = useRouter()
    let userInfo = ref({
        id: '213123123'
    })
    const Login = async () => {
        await router.push({
            name: "home",
        })
    }
    return {
        userInfo, Login
    }
})