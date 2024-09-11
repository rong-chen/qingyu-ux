import {defineStore} from "pinia";
import {ref} from "vue";
import {userStore} from "@/store/user.js";
import {useWebRTCStore} from "@/store/webrtc.js";
import {ElNotification} from "element-plus";
import {useSocketStore} from "@/store/websocketHandler/websocket.js";

export const useAudioStore = defineStore('useAudioStore', () => {
    const user = userStore()
    let isShowEle = ref(true);
    let videoStream = ref(null);
    let isSender = ref(false);
    let currentFriendId = ref("")
    let notifyEle = ref(null)
    const socketStore = useSocketStore()
    const webRtcStore = useWebRTCStore()
    const startCall = (id, fid) => {
        isShowEle.value = true
        isSender.value = true
        socketStore.send({
            type: "audio_conn", message: "发起语音请求", description: "apply", sender: id, receiver: fid
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
    // 占线
    const busy = () => {
        socketStore.send({
            type: "audio_conn",
            message: "占线",
            description: "占线",
            sender: user.userInfo.ID,
            receiver: currentFriendId.value
        })
    }
    // 用户通知
    const notify = () => {
        if (notifyEle.value) {
            busy()
            return
        }
        notifyEle = ElNotification({
            title: '语音通知',
            dangerouslyUseHTMLString: true,
            message: '<button class="audio_confirm receive">接收</button><button style="margin-left: 10px" class="refuse audio_refuse">拒绝</button>',
        })
        const audio_confirm = document.querySelector(".audio_confirm")
        const audio_refuse = document.querySelector(".audio_refuse")

        audio_confirm.addEventListener("click", async () => {
            isShowEle.value = true
            await confirm()
        })
        audio_refuse.addEventListener("click", async () => {
            await refuse()
        })

    }
    return {
        isShowEle, videoStream, startCall, isSender, refuse, confirm, currentFriendId, notify
    }
})
