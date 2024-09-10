import {defineStore} from "pinia";
import {userStore} from "@/store/user.js";
import {ref} from "vue";
import {Notify} from "@/common/notification.js";
import {getChatList} from "@/api/chat.js";
import {useWebRTCStore} from "@/store/webrtc.js";
import {ElNotification} from "element-plus";
import {useAudioStore} from "@/store/audio.js";

export const useSocketStore = defineStore("SocketStore", () => {
    let socket = ref(null)
    let user = userStore()
    let webrtcStore = useWebRTCStore()
    let chatList = ref([])
    let audioStore = useAudioStore()
    const openSocket = () => {
        if (socket.value) {
            socket.value.close()
        }
        socket.value = new WebSocket(`/socket/conn/ws/${user.userInfo.ID}`)
        socketEvent()
    }
    const socketEvent = () => {
        // websocket 打开的时候执行获取历史聊天记录
        socket.value.onopen = async (event) => {
            chatList.value = []
            const {data, code} = await getChatList()
            if (code === 0) {
                chatList.value = data
            }
        }
        // websocket 接收消息
        socket.value.onmessage = async (event) => {
            let data = JSON.parse(event.data)
            if (data.type === 'video') {
                await webrtcStore.onMessageFromServer(data)
            }
            if (data.type === 'text') {
                chatList.value.push(data)
                Notify()
            }
            if (data.type === 'audio_conn') {
                audioStore.currentFriendId = data.sender
                audioStore.isSender = false
                audioStore.isShowEle = true
                // 如果用户点击拒绝
                if (data.description === "拒绝" && audioStore.isShowEle) {
                    audioStore.isShowEle = false
                    return
                }
                // 如果用户点击同意
                if (data.description === "同意" && audioStore.isShowEle) {
                    // 交换发送offer
                    await webrtcStore.onMessageFromServer(data)
                }
            }
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
