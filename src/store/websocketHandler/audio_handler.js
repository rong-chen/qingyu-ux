import {useAudioStore} from "@/store/audio.js";

let audioStore = useAudioStore()
const audioSocketEvent = (data) => {
    if (data.description === 'apply') {
        audioStore.notify()
        return
    }
    // 如果用户点击拒绝
    if (data.description === "拒绝" && audioStore.isShowEle) {
        return
    }
    // 如果用户点击拒绝
    if (data.description === "占线" && audioStore.isShowEle) {
        audioStore.isShowEle = false
        return
    }
    // 如果用户点击同意
    if (data.description === "同意" && audioStore.isShowEle) {
        // 交换发送offer
        webrtcStore.onMessageFromServer(data)
    }
}
