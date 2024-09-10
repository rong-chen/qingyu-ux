<template>
  <div class="video-media-container" v-if="prop.friendId">
    <div>
      <audio style="width: 300px;height: 300px" controls class="audioMedia"></audio>
      <br>
      <video style="width: 300px;height: 300px" controls class="videoMedia2"></video>
      <el-button @click="">发送</el-button>
      <el-button @click="">接收</el-button>
    </div>
  </div>
</template>

<script setup>
import {useAudioStore} from "@/store/audio.js";
import {useSocketStore} from "@/store/websocket.js";
import {useWebRTCStore} from "@/store/webrtc.js";
import {onMounted} from "vue";

const socketStore = useSocketStore();
const webRtcStore = useWebRTCStore();
const audioStore = useAudioStore()
const opened = () => {

}
const prop = defineProps({
  friendId: String
})

onMounted(() => {

})
const clickHandler = () => {

}


</script>

<style lang="scss">
.video-media-container {
  .el-dialog {
    padding: 0;
  }
}
</style>
