<template>
  <div class="voiceClass-container">
    <div class="friend-container">
      <div class="left-container">
        <div class="title">用户id:12345678<span>
           <el-button link style="margin-left: 10px" @click="copyUserId">
             <template #icon>
                <el-icon color="white"><CopyDocument/></el-icon>
             </template>
           </el-button>
        </span></div>
      </div>
    </div>
    <div>聊天</div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {userStore} from "@/store/user.js";

const userEvent = userStore()


const copyUserId = () => {
  navigator.clipboard.writeText(userEvent.userInfo.id)
}
</script>

<style scoped lang="scss">
.voiceClass-container {
  width: 100%;
  height: 100%;
  display: flex;
  box-sizing: border-box;

  .friend-container {
    width: 200px;
    height: 100%;
  }

  .left-container {
    box-sizing: border-box;
    border-right: 1px solid white;
    height: 100%;

    .title {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid white;
    }
  }

}
</style>
