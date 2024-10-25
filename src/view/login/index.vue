<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-card">
        <div>
          <h1>清</h1>
          <h1 style="margin-top: 20px">语</h1>
        </div>
      </div>
      <div class="form-card">
        <div class="formTitle">
          登录
        </div>
        <div class="form-container">
          <el-form :data="form" class="form">
            <el-form-item>
              <el-input style="width: 100%" v-model="form.username" placeholder="用户名"/>
            </el-form-item>
            <el-form-item>
              <el-input v-model="form.password" placeholder="密码"/>
            </el-form-item>
            <el-form-item>
              <el-button style="width: 100%;margin-top: 30px" @click="dbSaveClick" type="primary">登录</el-button>
              <div style="width: 100%">
                <el-button style="width: 100%;margin-top: 10px">注册</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue"
import {useRouter} from "vue-router";
import {userStore} from "@/store/user.js";
import {ElMessage} from "element-plus";

const userEvent = userStore()
let form = ref({
  username: '',
  password: '',
})
const router = useRouter()
const dbSaveClick = () => {
  if (form.value.password && form.value.username) {
    userEvent.LoginEvent(form.value)
    return
  }
  ElMessage.error("请输入用户名密码")
}
</script>


<style scoped>
.login-container {
  height: 100%;
  width: 100%;
}

.form-group > label {
  width: 80px;
}

.login-form {
  width: 750px;
  height: 400px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  border-radius: 5%;
}

.login-card {
  width: 40%;
  height: 100%;
  display: flex;
  color: white;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 10px;
  background-image: url("@/assets/img/login-card.png");
  background-size: 100% 115%;
  box-shadow: 0 2px 4px #e4e4e4;
}

.form-card {
  width: 100%;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 4px #e4e4e4;
  border: 1px solid #e3e3e3;
}

.formTitle {
  font-size: 30px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #578dfd;
  margin-top: 30px;
  height: 60px;
}

.form-container {
  width: 400px;
  margin: 30px auto;
  height: calc(100% - 160px);
  display: flex;
}

.form-container > .form {
  width: 400px;
}
</style>
