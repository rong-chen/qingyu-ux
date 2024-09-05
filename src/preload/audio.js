import audioSrc from "@/assets/audio/notification.mp3";
import {ElLoading} from 'element-plus'

// 预加载消息提示音
export const NotificationAudio = (src = audioSrc) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(255, 255, 255, 0.7)',
    })
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.addEventListener('canplaythrough', () => {
            loading.close()
            resolve(audio)
        });
        audio.addEventListener('error', (e) => {
            reject(new Error('音频加载失败')); // 音频加载失败时拒绝 Promise
        });
        audio.load();
    })
}

