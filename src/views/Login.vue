<template>
  <div class="background">
    <img :src="background" />
  </div>
  <div class="login">
    <div class="title">ADMIN SEED 后台登录</div>
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
            autocomplete="on"
            prefix-icon="user"
            v-model="form.username"
            placeholder="请输入用户名"
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
          <el-button type="primary" :loading="submitLoading" @click="handleLogin(formRef)">登录</el-button>
          <el-button type="info" @click="toRegister">注册</el-button>
          <el-button @click="resetForm(formRef)">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import background from '@/assets/image/maldives.jpg'

const store = useStore()
const router = useRouter()

let submitLoading = ref(false)

const formRef = ref(null)

const form = reactive({
  username: 'admin',
  password: 'admin',
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
    if (value.length < 5) {
      callback(new Error('密码长度必须超过5位以上'))
    } else {
      callback()
    }
  }, 600)
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
      ElNotification({
        title: '错误',
        message: '用户名或密码验证失败',
        type: 'error',
      })
      console.log('error submit!')
      return false
    } else {
      submitLoading = true
      store.dispatch('memberLogin', form).then(() => {
        submitLoading = false
        // 获取用户信息
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
