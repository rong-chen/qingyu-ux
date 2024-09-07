<template>
  <div class="chat-page-container">
    <div class="title">
      用户张三
    </div>
    <div class="content">
      <div class="left-message">
        <el-avatar shape="square" :src="friendInfo.avatar"/>
        <div class="message-content multi-line-ellipsis">
          123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123
        </div>
      </div>
      <div class="right-message">
        <div class="message-content">
          123123
        </div>
        <el-avatar shape="square" :src="friendInfo.avatar"/>
      </div>
    </div>
    <div class="chat-input">
      <el-input class="sendInput" placeholder="原神启动" v-model="sendParams.text"/>
    </div>
  </div>
</template>
<script setup>
import {ref} from "vue";
import qinyulogo from "@/assets/img/qinyulogo.png"

let friendInfo = ref({
  avatar: qinyulogo,
})

let sendParams = ref({
  text: ''
})
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
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 130px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

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
