<template>
  <div class="voiceClass-container">
    <div class="friend-container">
      <div class="left-container">
        <div class="title ellipsis">用户id:{{ userEvent.userInfo.ID.slice(0, 8) }}<span>
           <el-button link style="margin-left: 10px" @click="copyUserId">
             <template #icon>
                <el-icon color="white"><CopyDocument/></el-icon>
             </template>
           </el-button>
        </span></div>
        <div class="classify infinite-list" style="overflow: auto;">
          <FriendList :data="classifyList" @select="clickItem"></FriendList>
        </div>
      </div>
    </div>
    <div style="width: calc(100% - 200px);">
      <chatPage :info = "currentFriendChat"></chatPage>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {userStore} from "@/store/user.js";
import chatPage from "@/components/chatPage/index.vue";
import {ElMessage} from "element-plus";
import {getClassifyList, SearchAllFriends} from "@/api/friends.js";
import FriendList from "@/components/FriendList.vue";

let currentFriendChat = ref("")
const clickItem =(item)=>{
  currentFriendChat.value = item.friendInfo
}
const userEvent = userStore()
const defaultProps = {
  children: 'children',
  label: 'label',
}
const classifyList = ref(
    [
      {
        label: '无分类',
        id: 0,
        children: [],
      }
    ]
)
onMounted(async () => {
  const {data, code} = await getClassifyList()
  if (code === 0) {
    data.forEach(item => {
      classifyList.value.push({
        label: item.label,
        id: item.id,
        children: []
      })
    })
    let res = await SearchAllFriends()
    if (res.code === 0) {
      classifyList.value.forEach((item, index) => {
        item.children = res.data.filter(item2 => {
          return item2.classifyId === item.id
        })
      })
    }
  }
})


const copyUserId = () => {
  navigator.clipboard.writeText(userEvent.userInfo.ID)
  ElMessage.success("复制成功")
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

    .classify {
      height: calc(100% - 56px);
      width: 100%;
    }

    .title {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid white;
      border-top-left-radius: 20px;
      color: white;
      box-sizing: border-box;
    }
  }
}
</style>

<style>
.voiceClass-container {
  .el-tree {
    background: transparent;
    color: white;
  }

  .el-tree-node__content:hover {
    background: transparent;
  }

  .el-tree-node:focus > .el-tree-node__content {
    background: transparent;
  }

}

</style>
