<template>
  <div class="background">
    <img :src="background" />
  </div>
  <div class="login">
    <div class="title">{{ siteName }} Login</div>
    <el-card class="box-card">
      <el-form
        autocomplete="on"
        ref="formRef"
        :model="form"
        :rules="rules"
        status-icon
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="Username" prop="username" required>
          <el-input
            type="text"
            autocomplete="on"
            prefix-icon="user"
            v-model="form.username"
            placeholder="please input username"
          />
        </el-form-item>
        <el-form-item label="Password" prop="password" required>
          <el-input
            type="password"
            autocomplete="on"
            prefix-icon="lock"
            v-model="form.password"
            placeholder="please input password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitLoading"
            :disabled="submitDisabled"
            @click="onLogin(formRef)"
          >Login</el-button>
          <el-button type="info" @click="toRegister">Go to register</el-button>
          <el-button @click="resetForm(formRef)">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { resetForm } from '@/utils/form'
import background from '@/assets/image/maldives.jpg'

const props = defineProps({
  redirect: {
    type: String,
    required: false,
  },
})

const store = useStore()
const router = useRouter()

const siteName = import.meta.env.VITE_SITE_NAME

const submitLoading = ref(false)
const submitDisabled = ref(false)

const formRef = ref(null)

const form = reactive({
  username: 'admin',
  password: 'admin',
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    callback(new Error('please input username'))
  } else {
    if (value.length < 3) {
      submitDisabled.value = true
      callback(new Error('username length must be over 3'))
    } else {
      submitDisabled.value = false
      callback()
    }
  }
}
const validatePassword = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    callback(new Error('please input password'))
  } else {
    if (value.length < 3) {
      submitDisabled.value = true
      callback(new Error('password length must be over 3'))
    } else {
      submitDisabled.value = false
      callback()
    }
  }
}

const rules = reactive({
  username: [{ trigger: ['change', 'blur'], validator: validateUsername }],
  password: [{ trigger: ['change', 'blur'], validator: validatePassword }],
})

const toRegister = () => router.push({ path: '/register' })

const onLogin = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return ElMessage.error('login form error')
    }
    submitLoading.value = true
    store.dispatch('memberLogin', form).then(() => {
      submitLoading.value = false
      // 获取账户信息
      store.dispatch('memberProfile').then(() => {
        router.replace({ path: props.redirect || '/' })
        return ElMessage.success('login success')
      })
    }).catch(error => {
      submitLoading.value = false
      return ElMessage.error(`login error: ${error.msg}`)
    })
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
