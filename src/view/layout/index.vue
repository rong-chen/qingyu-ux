<template>
  <div class="layout-layout">
    <el-container style="width: 100%;height: 100%">
      <el-aside class="menu" width="80px" height="100%" style="padding:20px 0">
        <el-menu class="menu">
          <el-menu-item class="elMenuItem" v-for="item in routes" @click="goPage(item)">
            <img :src="item.icon" :alt="item.name"/>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header">
            头部
          </div>
        </el-header>
        <el-main>
          <div class="content">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
import {useRoute, useRouter} from "vue-router";
import {onMounted} from "vue";
const router =useRouter()
const route = useRoute();
let routes = route.matched[0].children
const goPage = (item) => {
  console.log(item)
  router.push({
    name: item.name
  })
}
onMounted(() => {
  console.log()
})
</script>
<style scoped>
.layout-layout {
  height: 100%;
  width: 100%;
  background: #578dfd;
}


.menu {
  display: flex;
  background: transparent;
  flex-direction: column;
  align-items: center;
}

.content {
  background: #84adff;
  height: 100%;
  border-radius: 20px;
}
</style>
<style>
.el-menu {
  border-right: none;
}

.el-menu-item {
  border-radius: 10px;
}

.el-menu-item:hover {
  background: #91b6ff;
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
