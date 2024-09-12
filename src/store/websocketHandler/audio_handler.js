import {useAudioStore} from "@/store/audio.js";
import {useWebRTCStore} from "@/store/webrtc.js";
import {ElNotification} from "element-plus";

let audioStore = null
let webrtcStore = null
export const audioSocketEvent = async (data) => {
    if (!audioStore) {
        audioStore = useAudioStore()
    }

    if (!webrtcStore) {
        webrtcStore = useWebRTCStore()
    }

    if (data.description === '申请') {
        audioStore.applyNotify()
        return
    }

    // 拒绝
    if (data.description === "拒绝") {
        audioStore.refuseNotify()
        return
    }

    // 占线
    if (data.description === "占线") {
        audioStore.busyNotify()
        return
    }

    // 如果用户点击同意
    if (data.description === "同意") {
        await audioStore.agreeNotify(data)
    }
}
