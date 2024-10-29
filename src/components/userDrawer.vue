<template>
  <div class="userDrawer-container">
    <el-drawer
        v-model="visible"
        title="个人设置"
        direction="rtl"
    >
      <div class="setting-drawer">
        <ul>
          <li>
            <el-button @click="addRoom">添加房间</el-button>
          </li>
          <li>
            <el-button @click="addFriend">添加好友</el-button>
          </li>
          <li>
            <el-button @click="addClassify">添加目录</el-button>
          </li>
          <li>
            <el-button @click="exit">退出系统</el-button>
          </li>
        </ul>
      </div>
    </el-drawer>

    <el-dialog @close="roomDialogClose" :close-on-click-modal="false" v-model="roomFormDialog" title="新增" width="450">
      <template #default>
        <div class="room-dialog-content">
          <el-form :model="roomForm">
            <el-form-item label="">
              <el-input type="text" v-model="roomForm.label" placeholder="名称"></el-input>
            </el-form-item>
            <el-form-item label="">
              <el-input type="password" v-model="roomForm.password" placeholder="密码"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #footer>
        <div class="room-dialog-footer">
          <el-button type="info" @click="roomFormDialog = false">关闭</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {ref, watch} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {AddApplyFriend, CreateFriendClass} from "@/api/friends.js";
import {userStore} from "@/store/user.js";
import {useRouter} from "vue-router";
import AudioMedia from "@/components/MediaDevices/audioMedia.vue";
import {createRoom} from "@/api/room.js";

let roomForm = ref({
  label: "",
  password: "",
})
const user = userStore()
let visible = ref(false)

const onSubmit = async () => {
  let res = await createRoom(roomForm.value)
  if (res['code'] === 0) {
    ElMessage.success("新增成功")
    roomFormDialog.value = false
  }
}
const roomDialogClose=()=>{
  roomForm.value={}
}

let roomFormDialog = ref(false)

const show = () => {
  visible.value = true;
}
const router = useRouter()
const exit = () => {
  router.push({
    name: "login"
  })
  localStorage.removeItem("token")
}
const addFriend = () => {
  ElMessageBox.prompt('请输入用户ID', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '关闭',
  })
      .then(async ({value}) => {
        if (user.userInfo.ID === value) {
          ElMessage.error("不能添加自己为好友")
          return
        }
        const {code} = await AddApplyFriend({
          "userId": user.userInfo.ID,
          "friendId": value
        })
        if (code === 0) {
          ElMessage.success("添加成功，请耐心等待")
        }
      })
}
const addRoom = () => {
  roomFormDialog.value = true
}
const addClassify = () => {
  ElMessageBox.prompt('新增好友目录', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '关闭',
  })
      .then(async ({value}) => {
        const {code} = await CreateFriendClass({
          "cid": user.userInfo.ID,
          "label": value
        })
        if (code === 0) {
          ElMessage.success("添加成功")
        }
      })
}
defineExpose({
  show
})
</script>

<style scoped lang="scss">
.setting-drawer ul {
  display: flex;
  width: 100%;
  flex-wrap: wrap;

  li {
    list-style: none;
  }
}

</style>

<style>
.userDrawer-container {
  .el-drawer {
    background: #25272a;

    .el-drawer__header {
      color: white;
    }
  }
}
</style>
