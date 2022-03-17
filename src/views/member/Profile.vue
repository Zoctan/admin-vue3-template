<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <el-avatar :size="60" :src="member.memberData.avatar"></el-avatar>
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
        {{ member.member.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <user />
            </el-icon>Nickname
          </div>
        </template>
        {{ member.memberData.nickname }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <component :is="memberGenderMap[member.memberData.gender].label"></component>
            </el-icon>Gender
          </div>
        </template>
        {{ memberGenderMap[member.memberData.gender].label }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <flag />
            </el-icon>Status
          </div>
        </template>
        <el-tag
          size="small"
          :type="memberStatusMap[member.member.status].color"
        >{{ memberStatusMap[member.member.status].label }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <key />
            </el-icon>RoleName
          </div>
        </template>
        {{ member.role.name }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <lock />
            </el-icon>Lock
          </div>
        </template>
        <el-tag
          size="small"
          :type="memberLockMap[member.member.lock].color"
        >{{ memberLockMap[member.member.lock].label }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <clock />
            </el-icon>RegisterAt
          </div>
        </template>
        {{ member.member.created_at }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <clock />
            </el-icon>LoginedAt
          </div>
        </template>
        {{ member.member.logined_at }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>

  <el-dialog v-model="dialogProfileFormVisible" title="Update Profile" destroy-on-close>
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
        <el-select v-model="profileForm.gender">
          <el-option
            v-for="item in memberGenderMap"
            :key="item.id"
            :label="item.label"
            :value="item.id"
            :disabled="item.id === profileForm.gender"
          />
        </el-select>
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

  <el-dialog v-model="dialogPasswordFormVisible" title="Update Password" destroy-on-close>
    <el-form
      autocomplete="off"
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordFormRules"
      status-icon
      label-position="left"
      label-width="130px"
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
      <el-form-item label="New Password2" prop="checkPassword" required>
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
import { memberStatusMap, memberLockMap, memberGenderMap } from '@/utils'
import { resetForm } from '@/utils/form'
import { updateProfile, checkOldPassword, updatePassword } from '@/api/member'

const store = useStore()

const member = computed(() => store.getters.member)

// ------- profile -------
const submitProfileLoading = ref(false)
const submitProfileDisabled = ref(false)
const dialogProfileFormVisible = ref(false)

const profileFormRef = ref(null)
const profileForm = reactive({
  nickname: member.value.memberData.nickname,
  gender: member.value.memberData.gender,
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
      ElMessage.error('profile form error')
    }
    submitProfileLoading.value = true
    updateProfile(profileForm).then(() => {
      submitProfileLoading.value = false
      ElMessage.success('update profile success')
    }).catch((error) => {
      submitProfileLoading.value = false
      ElMessage.error(`update profile error: ${JSON.stringify(error)}`)
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
      callback(new Error(error))
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
      ElMessage.success('update password success')
    }).catch((error) => {
      submitPasswordLoading.value = false
      ElMessage.error(`update password error: ${JSON.stringify(error)}`)
    })
  })
}
</script>

<style lang="scss" scoped>
.card-header {
  text-align: center;
}
</style>