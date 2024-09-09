import {defineStore} from "pinia";
import {ref} from "vue";

export const useAudioStore = defineStore('useAudioStore', () => {
    let isShowEle = ref(true);
    let videoStream = ref(null);
    return {
        isShowEle,videoStream
    }
})
