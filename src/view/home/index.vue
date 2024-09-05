<template>
  <div class="home-container" v-loading="loading">
    <el-input class="search" placeholder="房间号" @input="searchHandler" v-model="form.search"></el-input>
    <div style="width: 100px;height: 100%" v-show='!voiceRoom.length'></div>
    <div class="card-container infinite-list" v-show='voiceRoom.length'>
      <div v-for="item in voiceRoom" class="cardItem">
        <el-card shadow="hover" style="display: flex"> 房间号:{{ item }}
          <div class="num">
            <span>
              {{ item }}
            </span>/
            <span>
              {{ item }}
            </span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";

let form = ref({
  search: "",
})
let loading = ref(false)
let voiceRoom = ref([])
onMounted(() => {
  voiceRoom.value = []
})
const searchHandler = () => {
  loading.value = true
  for (let i = 0; i < 1000; i++) {
    voiceRoom.value.push(i)
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
  max-height: 500px;
  overflow: auto;
  box-shadow: 0 2px 4px #e4e4e4;
  background: #fff;
  border-radius: 6px;
  padding: 20px;
}

.cardItem {
  width: 20%;
  padding: 5px;
  box-sizing: border-box;

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
}
</style>
