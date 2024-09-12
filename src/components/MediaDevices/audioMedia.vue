<template>
  <div v-show="show" class="audioMediaContainer">
    <div>
      <audio class="audioMedia"></audio>
    </div>
    <el-button>挂断</el-button>
  </div>
</template>

<script setup>
import {useAudioStore} from "@/store/audio.js";
import {computed, ref, onMounted} from "vue";
// 获取麦克风列表
let microphoneList = ref([])
const audioStore = useAudioStore()
const show = computed(() => {
  return audioStore['isShowEle']
})
onMounted(() => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // 弹框获取麦克风
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      // navigator.mediaDevices.enumerateDevices().then(function (devices) {
      //   devices.forEach(function (device) {
      //     if (device.kind === 'audioinput') { // 麦克风
      //       if (device.deviceId !== 'default' && device.deviceId !== 'communications') {
      //         Mic.push(device)
      //       }
      //     }
      //   });
      // })
      // 只是为了获取麦克风权限，获取以后立马关闭
      // stream.getTracks().forEach(track => track.stop());
    })
  }
})

</script>

<style scoped>
.audioMediaContainer {
  background-color: #ffffff;
  width: 400px;
  height: 100px;
  border-radius: 10px;
}

</style>
