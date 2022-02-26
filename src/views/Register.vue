<template>
  <div class="title">后台注册</div>
  <el-card class="box-card">
    <el-form
      autocomplete="on"
      ref="formRef"
      :model="form"
      :rules="rules"
      status-icon
      label-position="left"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username" required>
        <el-input
          type="text"
          autocomplete="off"
          prefix-icon="user"
          v-model="form.username"
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password" required>
        <el-input
          type="password"
          autocomplete="off"
          prefix-icon="lock"
          v-model="form.password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="二次密码" prop="password" required>
        <el-input
          type="password"
          autocomplete="off"
          prefix-icon="lock"
          v-model="form.checkPassword"
          placeholder="请第二次输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleRegister(formRef)"
        >注册</el-button>
        <el-button type="info" @click="toLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'

let submitLoading = ref(false)

const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  checkPassword: '',
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入用户名'))
  }
  setTimeout(() => {
    if (value.length < 3) {
      callback(new Error('账户名长度必须超过3位以上'))
    } else {
      callback()
    }
  }, 600)
}
const validatePassword = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  setTimeout(() => {
    if (value.length < 6) {
      callback(new Error('密码长度必须超过6位以上'))
    } else {
      if (form.checkPassword !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPassword', () => null)
      }
      callback()
    }
  }, 600)
}
const validateCheckPassword = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  setTimeout(() => {
    if (value.length < 6) {
      callback(new Error('密码长度必须超过6位以上'))
    } else if (value !== form.password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }, 600)
}

const rules = reactive({
  username: [{ trigger: 'blur', validator: validateUsername }],
  password: [{ trigger: 'blur', validator: validatePassword }],
  checkPassword: [{ trigger: 'blur', validator: validateCheckPassword }]
})

const store = useStore()
const router = useRouter()

const toLogin = () => router.push({ path: '/login' })

const handleRegister = (form) => {
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
      store.dispatch('memberregister', form).then(
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
.title {
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin-top: 2rem;
}
.box-card {
  margin: 0 auto;
  width: 30rem;
  margin-top: 2rem;
}
</style>
