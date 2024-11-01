import {createRouter, createWebHistory} from "vue-router";
import homeIcon from "@/assets/img/menu-icon/home.png"
import friends from "@/assets/img/menu-icon/friends.png"
import radio_room from "@/assets/img/menu-icon/radio_room.png"
import {GetUserInfo} from "@/api/user.js";
import {userStore} from "@/store/user.js";

const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', name: 'login', component: () => import('@/view/login/index.vue')},
    {
        path: '/layout', name: 'layout',
        component: () => import('@/view/layout/index.vue'),
        children: [
            {path: '', name: 'home', icon: homeIcon, component: () => import('@/view/home/index.vue')},
            {
                path: 'friendPage',
                name: 'friendPage',
                icon: friends,
                component: () => import('@/view/friendPage/index.vue')
            },
            {
                path: 'voiceClass',
                name: 'voiceClass',
                icon: radio_room,
                component: () => import('@/view/voiceClass/index.vue')
            },
        ]
    },
]

export const router = createRouter({
    history: createWebHistory(), routes,
})

router.beforeEach(async (to, from, next) => {
    if (to.path !== '/login' && !localStorage.getItem('token')) {
        await router.push('/login')
        return
    }
    next()
})
