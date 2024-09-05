import {createRouter, createWebHistory} from "vue-router";
import homeIcon from "@/assets/img/menu-icon/home.png"
const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', name: 'login', component: () => import('@/view/login/index.vue')},
    {
        path: '/layout', name: 'layout',
        component: () => import('@/view/layout/index.vue'),
        children: [
            {path: '', name: 'home',icon:homeIcon, component: () => import('@/view/home/index.vue')},
            {path: 'voiceClass', name: 'voiceClass',icon:homeIcon, component: () => import('@/view/voiceClass/index.vue')},
        ]
    },
]

export const router = createRouter({
    history: createWebHistory(), routes,
})

