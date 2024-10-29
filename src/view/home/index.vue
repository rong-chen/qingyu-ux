<template>
  <div class="home-container" v-loading="loading">
    <el-input class="search" placeholder="房间号" @input="searchHandler" v-model="form.rId"></el-input>
    <div style="width: 100px;height: 100%" v-show='!voiceRoom.length'></div>
    <div class="card-container infinite-list" v-show='voiceRoom.length'>
      <div v-for="item in voiceRoom" class="cardItem">
        <el-popover :width="200" trigger="click" placement="bottom" @hide="roomPassword = ''">
          <template #reference>
            <el-card shadow="hover">
              <div>
                <div> {{ item['label'] }}</div>
                <hr>
                <div style="font-size: 13px">
                  创建者:<span class="num">{{ item['createUser']['nickname'] }}</span>
                </div>
              </div>
            </el-card>
          </template>
          <div style="display: flex">
            <el-input style="width: 100px" v-model="roomPassword" placeholder="密码"></el-input>
            <el-button style="margin-left: 10px" type="primary" @click="joinBtnHandler(item)">加入</el-button>
          </div>
        </el-popover>
      </div>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";
import {collectRoom, getAllRoomList, getCreateRoomList} from "@/api/room.js";
import {userStore} from "@/store/user.js";
import {ElMessage} from "element-plus";

let roomPassword = ref("")

let form = ref({
  rId: "",
})
let loading = ref(false)
let userInfo = userStore()
let voiceRoom = ref([])
onMounted(() => {
  voiceRoom.value = []
})
const joinBtnHandler = async (room) => {
  let params = {
    "uid": userInfo.userInfo.ID,
    "rid": room['ID'],
    "password": roomPassword.value
  }
  let res = await collectRoom(params)
  if (res['code'] === 0) {
    ElMessage.success("加入成功")
  }
}
const searchHandler = async () => {
  if (!form.value.rId) return
  loading.value = true
  let res = await getAllRoomList({rId: form.value.rId})
  if (res['code'] === 0) {
    voiceRoom.value = res.data.filter(item => item['cId'] !== userInfo.userInfo.ID && !item['isCollect'])
  }
  loading.value = false
}

</script>
<style scoped lang="scss">
.home-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0 30px;
  height: 100%;
}

.search {
  width: 80%;
  margin: 100px auto 30px auto;
  height: 60px;
  font-size: 20px;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  width: 80%;
  margin: auto;
  box-sizing: border-box;
  max-height: 400px;
  overflow: auto;
  box-shadow: 0 2px 4px #e4e4e4;
  background: #fff;
  border-radius: 6px;
  padding: 20px;
}

.cardItem {
  padding: 5px;
  box-sizing: border-box;
  cursor: pointer;

  .num {
    font-size: 12px;
    color: #578dfd;
  }
}

</style>
<style>
.home-container .el-card {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.home-container .el-card .el-card__body {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home-container .el-input__wrapper {
  height: 60px;
  box-sizing: border-box;
}
</style>
