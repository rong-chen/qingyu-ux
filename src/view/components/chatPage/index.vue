<template>
  <div class="chat-page-container">
    <div class="title">
      {{ info.nickname }}
    </div>
    <div class="message-container" ref="messageRef" style="overflow: auto;height: calc(100% - 155px)">
      <div class="content" v-for="item in chatList" :key="item.id">
        <div class="left-message" v-show="item.sender === user.userInfo.ID">
          <el-avatar style="min-width: 40px;min-height: 40px" shape="square" :src="friendInfo.avatar"/>
          <div class="message-content multi-line-ellipsis">
            {{ item.message }}
          </div>
        </div>
        <div class="right-message" v-show="item.receiver === user.userInfo.ID">
          <div class="message-content">
            {{ item.message }}
          </div>
          <el-avatar shape="square" :src="friendInfo.avatar"/>
        </div>
      </div>
    </div>
    <div class="chat-input"  v-show="info.ID">
      <el-input @keyup.enter="handleEnter" class="sendInput" placeholder="原神启动"
                v-model="sendParams"/>
      <el-button style="height: 55px;margin-left: 10px;width: 55px" @click="audioHandler">
        <template #default>
          <el-icon size="20"><Microphone /></el-icon>
        </template>
      </el-button>
    </div>
  </div>
</template>
<script setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch, watchEffect} from "vue";
import qingyulogo from "@/assets/img/qinyulogo.png"
import {useSocketStore} from "@/store/websocket.js";
import {userStore} from "@/store/user.js";

const messageRef = ref(null)
const socketStore = useSocketStore();
const user = userStore()
let friendInfo = ref({
  avatar: qingyulogo,
})
onMounted(() => {
})
const scrollToBottom = () => {
  nextTick(() => {
    messageRef.value.scrollTop = messageRef.value.scrollHeight;
  })
}
const prop = defineProps({
  info: {
    type: String,
    required: true
  }
})
const audioHandler =()=>{
  console.log("audioHandler")
}
const handleEnter = () => {
  if (sendParams.value) {
    let params = {
      "type": "text",
      "message": sendParams.value,
      "description": "",
      "sender": user.userInfo.ID,
      "receiver": info.value.ID
    }
    socketStore.send(params)
    sendParams.value = ""
  }
}
const {info} = toRefs(prop)
const chatList = computed(() => socketStore.chatList.filter(item => item.sender === info.value.ID || item.receiver === info.value.ID));
watchEffect(() => {
  scrollToBottom()
  friendInfo.value = {...friendInfo.value, ...info.value};
})
watch(() => chatList, (newValue) => {
  scrollToBottom()
}, {
  deep: true
})

let sendParams = ref("")
</script>
<style scoped lang="scss">
.chat-page-container {
  width: 100%;
  height: 100%;
  position: relative;

  .title {
    height: 55px;
    border-bottom: 1px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: left;
    padding-left: 10px;
    box-sizing: border-box;
    color: white;
    font-weight: bold;
    font-size: 20px;
  }

  .chat-input {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;

    .sendInput {
      height: 55px;
      width: 60%;
      font-size: 20px;
    }
  }

  .content {
    color: white;
    position: relative;
    box-sizing: border-box;
    padding: 10px;
    min-height: 60px;

    .left-message {
      position: absolute;
      left: 10px;
      display: flex;

      .message-content {
        width: 60%;
        margin-left: 10px;
        border: 1px solid #4f6f9f;
        padding: 10px;
        border-radius: 10px;
        color: #494949;
        background: white;
        display: flex;
        flex-wrap: wrap;
      }
    }

    .right-message {
      position: absolute;
      right: 10px;
      display: flex;
      justify-content: right;

      .message-content {
        margin-right: 10px;
        border: 1px solid #4f6f9f;
        padding: 10px;
        border-radius: 10px;
        color: #494949;
        background: white;

      }
    }
  }
}
</style>

<style>
.el-input__wrapper.is-focus {
  box-shadow: none;
}
</style>
