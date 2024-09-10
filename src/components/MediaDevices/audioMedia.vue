<template>
  <div v-show="show" class="audioMediaContainer">
    <div style="width: 400px">
      <video class="videoMedia" style="width: 100%;height: 100%"></video>
    </div>
    <div  style="width: 400px">
      <video class="videoMedia2" style="width: 100%;height: 100%"></video>
    </div>
    <el-button type="primary" v-if="!audioStore.isSender" @click="audioStore.confirm()">接收</el-button>
    <el-button v-if="!audioStore.isSender" @click="audioStore.refuse()">拒绝</el-button>
    <el-button v-if="audioStore.isSender">取消</el-button>
  </div>
</template>

<script setup>
import {useAudioStore} from "@/store/audio.js";
import {computed} from "vue";

const audioStore = useAudioStore()
const show = computed(() => {
  return audioStore['isShowEle']
})

</script>

<style scoped>
.audioMediaContainer {
  background-color: #ffffff;
  width: 800px;
  height: 800px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

</style>
