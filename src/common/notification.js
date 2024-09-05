import {ElNotification} from "element-plus";
import {NotificationAudio} from "@/preload/audio.js";

// 来消息的时候通知
export const Notify = () => {
    NotificationAudio().then(res => {
        res.play()
        ElNotification({
            title: '消息通知',
            message: '有新消息来了',
        })
    })
}
