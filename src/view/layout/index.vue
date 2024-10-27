<template>
  <div class="layout-layout">
    <el-container style="width: 100%;height: 100%">
      <el-aside class="menu" width="80px" height="100%" style="padding:20px 0">
        <el-menu class="menu">
          <el-menu-item class="elMenuItem" :class="{
            'active':currentPage === item.name
          }" v-for="item in routes" @click="goPage(item)">
            <img :src="item['icon']" style="width: 32px;height: 32px; object-fit: contain; " :alt="item.name"/>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header">
            <div>
              头部
            </div>
            <div style="display: flex;align-items: center">
              <el-button link @click="openDrawer">
                <el-icon size="20" color="white">
                  <DArrowLeft/>
                </el-icon>
              </el-button>
            </div>
          </div>
        </el-header>
        <el-main>
          <div class="content">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
    <user-drawer ref='userDrawerRef'></user-drawer>
  </div>
</template>
<script setup>
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import UserDrawer from "@/components/userDrawer.vue";
import {GetUserInfo} from "@/api/user.js";
import {userStore} from "@/store/user.js";
import {useSocketStore} from "@/store/websocketHandler/websocket.js";
import AudioMedia from "@/components/MediaDevices/audioMedia.vue";

const socketStore = useSocketStore()
const router = useRouter()
const route = useRoute();
const userDrawerRef = ref(null)
let routes = route.matched[0].children
let currentPage = ref("home")
const goPage = (item) => {
  currentPage.value = item.name
  router.push({
    name: item.name
  })
}
const openDrawer = () => {
  console.log(userDrawerRef.value?.show())
}
onMounted(async () => {
  const res = await GetUserInfo()
  const user = userStore()
  if (res && res['code'] === 0) {
    user.userInfo = res.data
  }
  socketStore.openSocket()
})
</script>
<style scoped>
.layout-layout {
  height: 100%;
  width: 100%;
  background: #17181a;
}


.menu {
  display: flex;
  background: transparent;
  flex-direction: column;
  align-items: center;
}

.content {
  background: #25272a;
  height: 100%;
  border-radius: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  color: white;
  align-items: center;
  height: 100%;
  padding: 0 20px 0 0;
}
</style>
<style>
.el-menu {
  border-right: none;
}

.el-menu-item {
  border-radius: 5px;
  margin-top: 10px;
}

.el-menu-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.el-menu-item.active {
  background: rgba(255, 255, 255, 0.2);
}

.el-header {
  padding: 0;
  height: 50px;
}

.el-main {
  padding: 0;
  min-width: 1280px;
}
</style>
