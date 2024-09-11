<template>
  <div v-show="show" class="audioMediaContainer">
    <div>
      <audio class="audioMedia"></audio>
    </div>
    <div> 麦克风：
      <el-select
          v-model="value"
          placeholder="Select"
          size="large"
          style="width: 240px"
      >
        <el-option
            v-for="item in microphoneList"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
    </div>
    <el-button v-if="audioStore.isSender">取消</el-button>
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
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, -50%);
  border-radius: 10px;
}

</style>
