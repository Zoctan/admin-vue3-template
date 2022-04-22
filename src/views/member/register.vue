<template>
  <div class="background">
    <img :src="background" />
  </div>
  <div class="login">
    <div class="title">{{ siteName }} Register</div>
    <el-card class="box-card">
      <el-form ref="formRef" :model="form" :rules="rules" status-icon label-position="left" label-width="100px">
        <el-form-item label="Username" prop="username" required>
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="form.username"
            placeholder="Please input username" />
        </el-form-item>
        <el-form-item label="Password" prop="password" required>
          <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="form.password"
            placeholder="Please input password" show-password />
        </el-form-item>
        <el-form-item label="Password2" prop="checkPassword" required>
          <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="form.checkPassword"
            placeholder="Please input password again" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" :disabled="submitDisabled" @click="onRegister(formRef)">
            Register</el-button>
          <el-button type="info" @click="toLogin">Go to login</el-button>
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
import { resetForm } from 'utils/form'
import { isMemberExist } from 'api/member'
import background from 'assets/image/maldives.jpg'

const siteName = import.meta.env.VITE_SITE_NAME

const props = defineProps({
  redirect: {
    type: String,
    required: false,
  },
})

const store = useStore()
const router = useRouter()

const submitLoading = ref(false)
const submitDisabled = ref(false)
const formRef = ref()
const form = reactive({
  username: '',
  password: '',
  checkPassword: '',
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    callback(new Error('Please input username'))
  } else {
    if (value.length < 3) {
      submitDisabled.value = true
      callback(new Error('Username length must be over 3'))
    } else {
      isMemberExist({ username: value }).then(() => {
        submitDisabled.value = false
        callback()
      }).catch(error => {
        callback(new Error(error))
      })
    }
  }
}
const validatePassword = (rule, value, callback) => {
  if (!value) {
    submitDisabled.value = true
    callback(new Error('Please input password'))
  } else {
    if (value.length < 3) {
      submitDisabled.value = true
      callback(new Error('Password length must be over 3'))
    } else {
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
    callback(new Error('Please input password again'))
  } else {
    if (value !== form.password) {
      submitDisabled.value = true
      callback(new Error('Two password inputed are not same'))
    } else {
      submitDisabled.value = false
      callback()
    }
  }
}

const rules = reactive({
  username: [{ trigger: ['change', 'blur'], validator: validateUsername }],
  password: [{ trigger: ['change', 'blur'], validator: validatePassword }],
  checkPassword: [{ trigger: ['change', 'blur'], validator: validateCheckPassword }],
})

const toLogin = () => router.push({ path: '/login' })

const onRegister = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return ElMessage.error('Register form error')
    }
    submitLoading.value = true
    store.dispatch('memberRegister', form)
      .then(() => {
        store.dispatch('memberProfile')
          .then(() => {
            router.replace({ path: props.redirect || '/member/profile' })
            ElMessage.success('Register success')
          })
      })
      .catch((error) => {
        ElMessage.error('Register error')
        console.error('Register error', error)
      })
      .finally(() => {
        submitLoading.value = false
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
