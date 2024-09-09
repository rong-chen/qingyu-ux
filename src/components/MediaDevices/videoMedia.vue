<template>
  <div class="video-media-container">

      <div>
        <video style="width: 300px;height: 300px" controls class="videoMedia"></video>
        <br>
        <video style="width: 300px;height: 300px" controls class="videoMedia2"></video>
        <el-button @click="webRtcStore.startCall('1c074c6c-6cc7-11ef-bfa5-047c16533444')">发送</el-button>
        <el-button @click="webRtcStore.answerCall('1c074c6c-6cc7-11ef-bfa5-047c16533444')">接收</el-button>
      </div>
  </div>
</template>

<script setup>
import {useAudioStore} from "@/store/audio.js";
import {useSocketStore} from "@/store/websocket.js";
import {useWebRTCStore} from "@/store/webrtc.js";
const socketStore = useSocketStore();
const webRtcStore = useWebRTCStore();
const audioStore = useAudioStore()
const opened = () => {

}
const clickHandler =()=>{

}


</script>

<style lang="scss">
.video-media-container {
  .el-dialog {
    padding: 0;
  }
}
</style>
