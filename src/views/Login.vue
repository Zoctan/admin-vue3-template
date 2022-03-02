<template>
  <div class="background">
    <img :src="background" />
  </div>
  <div class="login">
    <div class="title">{{ siteName }} 后台登录</div>
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
            autocomplete="on"
            prefix-icon="user"
            v-model="form.username"
            placeholder="请输入账户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input
            type="password"
            autocomplete="on"
            prefix-icon="lock"
            v-model="form.password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitLoading"
            :disabled="submitDisabled"
            @click="handleLogin(formRef)"
          >登录</el-button>
          <el-button type="info" @click="toRegister">注册</el-button>
          <el-button @click="resetForm(formRef)">重置</el-button>
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

const store = useStore()
const router = useRouter()

const siteName = import.meta.env.VITE_SITE_NAME

let submitLoading = ref(false)
let submitDisabled = ref(false)

const formRef = ref(null)

const form = reactive({
  username: 'admin',
  password: 'admin',
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    return callback(new Error('请输入账户名'))
  } else {
    if (value.length < 3) {
      submitDisabled.value = true
      callback(new Error('账户名长度必须超过3位以上'))
    } else {
      submitDisabled.value = false
      callback()
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
      submitDisabled.value = false
      callback()
    }
  }
}

const rules = reactive({
  username: [{ trigger: 'blur', validator: validateUsername }],
  password: [{ trigger: 'blur', validator: validatePassword }]
})

const toRegister = () => router.push({ path: '/register' })

const resetForm = (form) => {
  if (!form) return
  // 重置回初始状态，如果表单初始化了数据，就是那个原始数据，而不是清空
  form.resetFields()
}

const handleLogin = (formEl) => {
  console.debug('formEl', formEl)
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      new Error('账户名或密码验证失败')
    } else {
      submitLoading.value = true
      store.dispatch('memberLogin', form).then(() => {
        submitLoading.value = false
        // 获取账户信息
        store.dispatch('memberProfile').then((member) => {
          // 生成路由表
          store.dispatch('generateRoutes', member).then(() => {
            store.getters.addRouters.forEach(_router => {
              router.addRoute(_router)
            })
            router.push({ path: '/' })
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
