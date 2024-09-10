import {defineStore} from "pinia";
import {ref} from "vue";
import {useSocketStore} from "@/store/websocket.js";
import {userStore} from "@/store/user.js";
import {useWebRTCStore} from "@/store/webrtc.js";

export const useAudioStore = defineStore('useAudioStore', () => {
    const user = userStore()
    let isShowEle = ref(false);
    let videoStream = ref(null);
    let isSender = ref(false);
    let currentFriendId = ref("")
    const socketStore = useSocketStore()
    const webRtcStore = useWebRTCStore()
    const startCall = (id, fid) => {
        isShowEle.value = true
        isSender.value = true
        socketStore.send({
            type: "audio_conn", message: "发起语音请求", description: "发起语音请求", sender: id, receiver: fid
        })
    }
    // 用户拒绝
    const refuse = () => {
        socketStore.send({
            type: "audio_conn",
            message: "拒绝",
            description: "拒绝",
            sender: user.userInfo.ID,
            receiver: currentFriendId.value
        })
        isShowEle.value = false
    }

    // 接收
    const confirm = async () => {
        await webRtcStore.CreatePeerConnection(currentFriendId.value)
        await webRtcStore.Call()
        socketStore.send({
            type: "audio_conn",
            message: "同意",
            description: "同意",
            sender: user.userInfo.ID,
            receiver: currentFriendId.value
        })
    }
    return {
        isShowEle, videoStream, startCall, isSender, refuse, confirm, currentFriendId
    }
})
