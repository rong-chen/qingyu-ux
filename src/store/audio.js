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
    const socketStore = useSocketStore()
    const webRtcStore = useWebRTCStore()
    let audioNotifyEle = ref(null)
    let time = ref(30)

    // 申请弹窗
    const applyNotify = () => {
        if (audioNotifyEle.value) {
            return
        }
        audioNotifyEle.value = ElNotification({
            title: `语音通知`,
            dangerouslyUseHTMLString: true,
            duration: 0,
            message: `<button class="audio_confirm receive">接收</button><button style="margin-left: 10px" class="refuse audio_refuse">拒绝</button>`,
        })

        const audio_confirm = document.querySelector(".audio_confirm")
        const audio_refuse = document.querySelector(".audio_refuse")

        async function audio_confirm_click() {
            await confirmBtnHandler()
        }

        async function audio_refuse_click() {
            await refuseBtnHandler()
        }

        let interval = setInterval(() => {
            audio_confirm.textContent = `接收${time.value}s`
            if (time.value <= 0) {
                clearInterval(interval)
                if (audioNotifyEle.value) {
                    audioNotifyEle.value.close()
                    audioNotifyEle.value = null
                    time.value = 30
                }
                if (audio_confirm) {
                    audio_confirm.removeEventListener("click", audio_confirm_click)

                }
                if (audio_refuse) {
                    audio_refuse.removeEventListener("click", audio_refuse_click)
                }
            }
            time.value -= 1
        }, 1000)
        audio_confirm.addEventListener("click", audio_confirm_click)
        audio_refuse.addEventListener("click", audio_refuse_click)
    }
    // 拒绝
    const refuseNotify = () => {
        if (audioNotifyEle.value) {
            audioNotifyEle.value.close()
            audioNotifyEle.value = null
        }
        audioNotifyEle.value = ElNotification.error("用户拒绝")
        if (webRtcStore.peerConnection) {
            webRtcStore.peerConnection.close()
            webRtcStore.peerConnection = null
        }
    }

    const startCall = (id, fid) => {
        if (audioNotifyEle.value) {
            audioNotifyEle.value.close()
            audioNotifyEle.value = null
        }
        audioNotifyEle.value = ElNotification({
            message: "等待对面操作中。。。", duration: 0, type: "success",
        })
        let interval = setInterval(() => {
            if (time.value <= 0) {
                clearInterval(interval)
                if (audioNotifyEle.value) {
                    console.log(123)
                    audioNotifyEle.value.close()
                    audioNotifyEle.value = null
                }
            }
            time.value--
        }, 1000)
        socketStore.send({
            type: "audio_conn", message: "发起语音请求", description: "申请", sender: id, receiver: fid
        })
    }
    // 当前用户拒绝按钮
    const refuseBtnHandler = () => {
        if (audioNotifyEle.value) {
            audioNotifyEle.value.close()
            audioNotifyEle.value = null
        }
        socketStore.send({
            type: "audio_conn",
            message: "拒绝",
            description: "拒绝",
            sender: user.userInfo.ID,
            receiver: currentFriendId.value
        })
    }

    //当前用户 接收 按钮
    const confirmBtnHandler = async () => {
        if (audioNotifyEle.value) {
            audioNotifyEle.value.close()
            audioNotifyEle.value = null
        }
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
    const busyBtnHandler = () => {
        socketStore.send({
            type: "audio_conn",
            message: "占线",
            description: "占线",
            sender: user.userInfo.ID,
            receiver: currentFriendId.value
        })
    }

    // 占线
    const busyNotify = () => {

    }
    // 对面同意
    const agreeNotify = async (data) => {
        if (audioNotifyEle.value) {
            audioNotifyEle.value.close()
            audioNotifyEle.value = null
        }
        await webRtcStore.onMessageFromServer(data)
    }
    return {
        isShowEle,
        videoStream,
        startCall,
        isSender,
        confirm,
        currentFriendId,
        audioNotifyEle,
        applyNotify,
        refuseNotify,
        busyNotify,
        agreeNotify
    }
})
