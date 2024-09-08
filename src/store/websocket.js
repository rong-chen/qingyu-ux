import {defineStore} from "pinia";
import {userStore} from "@/store/user.js";
import {ref} from "vue";
import {Notify} from "@/common/notification.js";
import {getChatList} from "@/api/chat.js";

export const useSocketStore = defineStore("SocketStore", () => {
    let socket = ref(null)
    let user = userStore()
    let chatList = ref([])
    const openSocket = () => {
        if (socket.value) {
            socket.value.close()
        }
        socket.value = new WebSocket(`/socket/conn/ws/${user.userInfo.ID}`)
        socketEvent()
    }
    const socketEvent = () => {
        socket.value.onopen = async (event) => {
            chatList.value = []
            const {data, code} = await getChatList()
            if (code === 0) {
                chatList.value = data
            }
        }
        socket.value.onmessage = (event) => {
            let data = event.data
            if (data) {
                chatList.value.push(JSON.parse(data))
            }
            Notify()
        }
        socket.value.onerror = (event) => {
            // alert("连接断开")
        }
    }
    const send = (val) => {
        chatList.value.push(val)
        socket.value.send(JSON.stringify(val))
    }

    return {
        socket, openSocket, chatList, send
    }
})