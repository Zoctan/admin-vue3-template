<template>
  <div class="login-container">
    <el-form
      class
      autocomplete="on"
      ref="loginFormRef"
      v-model="loginForm"
      :rules="loginRules"
      status-icon
      label-position="left"
      label-width="50px"
    >
      <h3 class="title">后台登录</h3>
      <el-form-item label="用户名" prop="username" required>
        <el-input type="text" autocomplete="on" :model="loginForm.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="password" prop="password" required>
        <el-input type="password" autocomplete="on" :model="loginForm.password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item prop="remember">
        <el-checkbox label="记住我" :model="loginForm.remember" name="remember"></el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitLoading" @click="handleLogin(loginFormRef)">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'

let submitLoading = ref(false)

const validateUsername = (rule, value, callback) => {
  if (value.length < 3) callback(new Error('账户名长度必须在3或以上'))
  else callback()
}
const validatePassword = (rule, value, callback) => {
  if (value.length < 6) callback(new Error('密码长度必须在6或以上'))
  else callback()
}

const loginFormRef = ref(null)

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  remember: false,
})

const loginRules = reactive({
  username: [
    { trigger: 'blur', validator: validateUsername }
  ],
  password: [
    { trigger: 'blur', validator: validatePassword }
  ]
})

const store = useStore()
const router = useRouter()
const handleLogin = (form) => {
  if (!form) return
  form.validate((valid) => {
    if (!valid) {
      ElNotification({
        title: '错误',
        message: '用户名或密码验证失败',
        type: 'error',
      })
      console.log('error submit!')
      return false
    } else {
      submitLoading = true
      store.dispatch('memberLogin', form).then(
        () => {
          submitLoading = false
          router.push({ path: '/' })
        },
        (error) => {
          ElNotification({
            title: '错误',
            message: error,
            type: 'error',
          })
        })
    }
  })
}
</script>

<style lang="scss" scoped>
</style>
