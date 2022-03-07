<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <el-avatar :size="60" :src="memberData.avatar"></el-avatar>
      </div>
    </template>
    <el-descriptions :column="3" size="large" border>
      <template #extra>
        <el-button class="button" @click="dialogProfileFormVisible = true">update profile</el-button>
        <el-button class="button" @click="dialogPasswordFormVisible = true">update password</el-button>
      </template>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <avatar />
            </el-icon>Username
          </div>
        </template>
        {{ member.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <user />
            </el-icon>Nickname
          </div>
        </template>
        {{ memberData.nickname }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <component :is="memberGenderMap[memberData.gender]"></component>
            </el-icon>Gender
          </div>
        </template>
        {{ memberGenderMap[memberData.gender] }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <flag />
            </el-icon>Status
          </div>
        </template>
        <el-tag size="small">{{ memberStatusMap[member.status] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <clock />
            </el-icon>Register At
          </div>
        </template>
        {{ member.created_at }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <clock />
            </el-icon>Logined At
          </div>
        </template>
        {{ member.logined_at }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>

  <el-dialog v-model="dialogProfileFormVisible" title="Update Profile">
    <el-form
      autocomplete="off"
      ref="profileFormRef"
      :model="profileForm"
      :rules="profileFormRules"
      status-icon
      label-position="left"
      label-width="100px"
    >
      <el-form-item label="Nickname" prop="nickname" required>
        <el-input
          type="text"
          autocomplete="off"
          prefix-icon="user"
          v-model="profileForm.nickname"
          placeholder="please input nickname"
        />
      </el-form-item>
      <el-form-item label="Gender" prop="gender" required>
        <el-radio-group v-model="profileForm.gender">
          <el-radio-button label="0">None</el-radio-button>
          <el-radio-button label="1">Man</el-radio-button>
          <el-radio-button label="2">Female</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogProfileFormVisible = false">Cancel</el-button>
        <el-button type="danger" @click="resetForm(profileFormRef)">Reset</el-button>
        <el-button
          type="primary"
          :loading="submitProfileLoading"
          :disabled="submitProfileDisabled"
          @click="onUpdateProfile(profileFormRef)"
        >Confirm</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="dialogPasswordFormVisible" title="Update Password">
    <el-form
      autocomplete="off"
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordFormRules"
      status-icon
      label-position="left"
      label-width="100px"
    >
      <el-form-item label="Old Password" prop="oldPassword" required>
        <el-input
          type="password"
          autocomplete="off"
          prefix-icon="lock"
          v-model="passwordForm.oldPassword"
          placeholder="please input old password"
          show-password
        />
      </el-form-item>
      <el-form-item label="New Password" prop="newPassword" required>
        <el-input
          type="password"
          autocomplete="off"
          prefix-icon="lock"
          v-model="passwordForm.newPassword"
          placeholder="please input new password"
          show-password
        />
      </el-form-item>
      <el-form-item label="New Password Again" prop="checkPassword" required>
        <el-input
          type="password"
          autocomplete="off"
          prefix-icon="lock"
          v-model="passwordForm.checkPassword"
          placeholder="please input new password again"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogPasswordFormVisible = false">Cancel</el-button>
        <el-button type="danger" @click="resetForm(passwordFormRef)">Reset</el-button>
        <el-button
          type="primary"
          :loading="submitPasswordLoading"
          :disabled="submitPasswordDisabled"
          @click="onUpdatePassword(passwordFormRef)"
        >Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { memberGenderMap, memberStatusMap } from '@/utils'
import { resetForm } from '@/utils/form'
import { updateProfile, checkOldPassword, updatePassword } from '@/api/member'

const store = useStore()

const member = computed(() => store.getters.member.member)
const memberData = computed(() => store.getters.member.memberData)

// ------- profile -------
const submitProfileLoading = ref(false)
const submitProfileDisabled = ref(false)
const dialogProfileFormVisible = ref(false)

const profileFormRef = ref(null)

const profileForm = reactive({
  nickname: memberData.value.nickname,
  gender: memberData.value.gender,
})

const validateNickname = (rule, value, callback) => {
  if (!value) {
    submitProfileDisabled.value = true
    return callback(new Error('please input nickname'))
  } else {
    if (value.length < 3) {
      submitProfileDisabled.value = true
      callback(new Error('nickname length must be over 3'))
    } else {
      submitProfileDisabled.value = false
      callback()
    }
  }
}

const profileFormRules = reactive({
  nickname: [{ trigger: ['change', 'blur'], validator: validateNickname }]
})

const onUpdateProfile = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return ElMessage.error('profile form error')
    }
    submitProfileLoading.value = true
    updateProfile(profileForm).then(() => {
      submitProfileLoading.value = false
      return ElMessage.success('update profile success')
    }).catch((error) => {
      submitProfileLoading.value = false
      return ElMessage.error(`update profile error: ${error.msg}`)
    })
  })
}

// ------- password -------
const submitPasswordLoading = ref(false)
const submitPasswordDisabled = ref(false)
const dialogPasswordFormVisible = ref(false)

const passwordFormRef = ref(null)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

const validateOldPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('please input old password'))
  } else {
    checkOldPassword({ oldPassword: value }).then(() => {
      submitPasswordDisabled.value = false
      callback()
    }).catch(error => {
      callback(new Error(error.msg))
    })
  }
}
const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('please input new password'))
  } else {
    if (value.length < 3) {
      submitPasswordDisabled.value = true
      callback(new Error('new password length must be over 3'))
    } else {
      if (passwordForm.checkPassword !== '') {
        if (!passwordFormRef.value) return
        passwordFormRef.value.validateField('checkPassword')
      }
      submitPasswordDisabled.value = false
      callback()
    }
  }
}
const validateCheckPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('please input password again'))
  } else {
    if (value !== passwordForm.newPassword) {
      submitPasswordDisabled.value = true
      callback(new Error('two password inputed are not same'))
    } else {
      submitPasswordDisabled.value = false
      callback()
    }
  }
}

const passwordFormRules = reactive({
  oldPassword: [{ trigger: ['change', 'blur'], validator: validateOldPassword }],
  newPassword: [{ trigger: ['change', 'blur'], validator: validateNewPassword }],
  checkPassword: [{ trigger: ['change', 'blur'], validator: validateCheckPassword }],
})

const onUpdatePassword = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return ElMessage.error('password form error')
    }
    submitPasswordLoading.value = true
    updatePassword(passwordForm).then(() => {
      submitPasswordLoading.value = false
      return ElMessage.success('update password success')
    }).catch((error) => {
      submitPasswordLoading.value = false
      return ElMessage.error(`update password error: ${error}`)
    })
  })
}
</script>

<style lang="scss" scoped>
.card-header{
  text-align: center;
}
</style>