<template>
  <div class="background">
    <img :src="background" />
  </div>
  <div class="login">
    <div class="title">{{ siteName }} 后台注册</div>
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
        <el-form-item label="账户名" prop="username" required>
          <el-input
            type="text"
            autocomplete="off"
            prefix-icon="user"
            v-model="form.username"
            placeholder="请输入账户名"
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
        <el-form-item label="二次密码" prop="checkPassword" required>
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
            :disabled="submitDisabled"
            @click="handleRegister(formRef)"
          >注册</el-button>
          <el-button type="info" @click="toLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import background from '@/assets/image/maldives.jpg'
import { checkExist } from '@/api/member'

const store = useStore()
const router = useRouter()

const siteName = import.meta.env.VITE_SITE_NAME

let submitLoading = ref(false)
let submitDisabled = ref(false)

const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  checkPassword: '',
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    callback(new Error('请输入账户名'))
  } else {
    if (value.length < 3) {
      submitDisabled.value = true
      callback(new Error('账户名长度必须超过3位以上'))
    } else {
      checkExist({ username: value }).then(() => {
        submitDisabled.value = false
        callback()
      }).catch(error => {
        callback(new Error(error.msg))
      })
    }
  }
}
const validatePassword = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    callback(new Error('请输入密码'))
  } else {
    if (value.length < 3) {
      submitDisabled.value = true
      callback(new Error('密码长度必须超过3位以上'))
    } else {
      console.debug('form.checkPassword', form.checkPassword)
      if (form.checkPassword !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPassword')
      }
      submitDisabled.value = false
      callback()
    }
  }
}
const validateCheckPassword = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    callback(new Error('请输入二次密码'))
  } else {
    console.debug('form.password', form.password)
    if (value !== form.password) {
      submitDisabled.value = true
      callback(new Error('两次输入的密码不一致'))
    } else {
      submitDisabled.value = false
      callback()
    }
  }
}

const rules = reactive({
  username: [{ trigger: 'blur', validator: validateUsername }],
  password: [{ trigger: ['change', 'blur'], validator: validatePassword }],
  checkPassword: [{ trigger: ['change', 'blur'], validator: validateCheckPassword }]
})

const toLogin = () => router.push({ path: '/login' })

const handleRegister = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      new Error('账户名或密码验证失败')
    } else {
      submitLoading.value = true
      store.dispatch('memberRegister', form).then(() => {
        submitLoading.value = false
        store.dispatch('memberProfile').then((member) => {
          store.dispatch('generateRoutes', member).then(() => {
            store.getters.addRouters.forEach(_router => {
              router.addRoute(_router)
            })
            router.push({ path: '/member/profile' })
          })
        })
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.background {
  width: 100%;
  height: 100%;
  z-index: -1;
  position: absolute;
  img {
    width: 100%;
    height: 100%;
  }
}
.login {
  z-index: 1;
  position: absolute;
  width: 100%;
  margin-top: 5rem;
  .title {
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    color: white;
  }
  .box-card {
    margin: 0 auto;
    width: 30rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
}
</style>
