<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <el-avatar :size="60" :src="member.memberData.avatar"></el-avatar>
      </div>
    </template>
    <el-descriptions :column="3" size="large" border>
      <template #extra>
        <el-button class="button" @click="dialogProfileVisible = true">Update Profile</el-button>
        <el-button class="button" @click="dialogPasswordVisible = true">Update Password</el-button>
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
      <el-descriptions-item v-if="memberGenderMap.length > 0">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <component :is="memberGenderMap[member.memberData.gender].label"></component>
            </el-icon>Gender
          </div>
        </template>
        {{ memberGenderMap[member.memberData.gender].label }}
      </el-descriptions-item>
      <el-descriptions-item v-if="memberStatusMap.length > 0">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <flag />
            </el-icon>Status
          </div>
        </template>
        <el-tag size="small" :type="memberStatusMap[member.member.status].color">
          {{ memberStatusMap[member.member.status].label }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <key />
            </el-icon>RoleName
          </div>
        </template>
        <template v-for="role in member.roleList" :key="role.id">
          <el-tag size="small" effect="plain" class="mr-1">
            {{ role.name }}</el-tag>
        </template>
      </el-descriptions-item>
      <el-descriptions-item v-if="memberLockMap.length > 0">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <lock />
            </el-icon>Lock
          </div>
        </template>
        <el-tag size="small" :type="memberLockMap[member.member.lock].color">
          {{ memberLockMap[member.member.lock].label }}
        </el-tag>
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

  <el-dialog v-model="dialogProfileVisible" title="Update Profile" destroy-on-close>
    <el-form ref="profileFormRef" :model="profileForm" :rules="profileFormRules" status-icon label-position="left"
      label-width="100px">
      <el-form-item label="Nickname" prop="memberData.nickname" required>
        <el-input type="text" autocomplete="off" prefix-icon="user" v-model="profileForm.memberData.nickname"
          placeholder="Please input nickname">
          <template #append>
            <el-button icon="refresh-right" @click="getFakeNickname" :loading="getFakeNicknameLoading"
              :disabled="getFakeNicknameDisabled" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="Gender" prop="memberData.gender" required>
        <el-select v-model="profileForm.memberData.gender">
          <el-option v-for="item in memberGenderMap" :key="item.value" :label="item.label" :value="item.value"
            :disabled="item.value === profileForm.memberData.gender" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogProfileVisible = false">Cancel</el-button>
        <el-button type="danger" @click="resetForm(profileFormRef)">Reset</el-button>
        <el-button type="primary" :loading="submitProfileLoading" :disabled="submitProfileDisabled"
          @click="onUpdateProfile(profileFormRef)">Confirm</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="dialogPasswordVisible" title="Update Password" destroy-on-close>
    <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordFormRules" status-icon label-position="left"
      label-width="130px">
      <el-form-item label="Old Password" prop="oldPassword" required>
        <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="passwordForm.oldPassword"
          placeholder="Please input old password" show-password />
      </el-form-item>
      <el-form-item label="New Password" prop="newPassword" required>
        <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="passwordForm.newPassword"
          placeholder="Please input new password" show-password />
      </el-form-item>
      <el-form-item label="New Password2" prop="checkPassword" required>
        <el-input type="password" autocomplete="off" prefix-icon="lock" v-model="passwordForm.checkPassword"
          placeholder="Please input new password again" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogPasswordVisible = false">Cancel</el-button>
        <el-button type="danger" @click="resetForm(passwordFormRef)">Reset</el-button>
        <el-button type="primary" :loading="submitPasswordLoading" :disabled="submitPasswordDisabled"
          @click="onUpdatePassword(passwordFormRef)">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm } from 'utils/form'
import Pair from 'utils/Pair'
import { updateProfile, validateOldPassword as validateMemberOldPassword, updatePassword, } from 'api/member'
import { getName as getFakeName } from 'api/fake'

const memberStatusMap = ref([])
const memberLockMap = ref([])
const memberGenderMap = ref([])

onMounted(async () => {
  const dataList = await Pair.getValueByKey(['memberStatusMap', 'memberLockMap', 'memberGenderMap'])
  memberStatusMap.value = dataList[0].value
  memberLockMap.value = dataList[1].value
  memberGenderMap.value = dataList[2].value
})

const store = useStore()

const member = computed(() => store.getters.member)

// ------- profile -------
const submitProfileLoading = ref(false)
const submitProfileDisabled = ref(false)
const getFakeNicknameLoading = ref(false)
const getFakeNicknameDisabled = ref(false)
const dialogProfileVisible = ref(false)
const profileFormRef = ref(null)
const profileForm = reactive({
  memberData: {
    nickname: member.value.memberData.nickname,
    gender: member.value.memberData.gender,
  }
})

const getFakeNickname = () => {
  getFakeNicknameLoading.value = true
  getFakeNicknameDisabled.value = true
  getFakeName()
    .then((response) => {
      profileForm.memberData.nickname = response.data
    })
    .catch((error) => {
      ElMessage.error('Get fake nickname error')
      console.error('Get fake nickname error', error)
    })
    .finally(() => {
      getFakeNicknameLoading.value = false
      getFakeNicknameDisabled.value = false
    })
}

const validateNickname = (rule, value, callback) => {
  if (!value) {
    submitProfileDisabled.value = true
    return callback(new Error('Please input nickname'))
  } else {
    if (value.length < 3) {
      submitProfileDisabled.value = true
      callback(new Error('Nickname length must be over 3'))
    } else {
      submitProfileDisabled.value = false
      callback()
    }
  }
}

const profileFormRules = reactive({
  memberData: {
    nickname: [{ trigger: ['change', 'blur'], validator: validateNickname }],
  }
})

const onUpdateProfile = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      ElMessage.error('Profile form error')
    }
    submitProfileLoading.value = true
    updateProfile(profileForm)
      .then(async () => {
        // get member profile
        await store.dispatch('memberProfile')
        ElMessage.success('Update profile success')
        dialogProfileVisible.value = false
      })
      .catch((error) => {
        ElMessage.error('Update profile error')
        console.error('Update profile error', error)
      })
      .finally(() => {
        submitProfileLoading.value = false
      })
  })
}

// ------- password -------
const submitPasswordLoading = ref(false)
const submitPasswordDisabled = ref(false)
const dialogPasswordVisible = ref(false)

const passwordFormRef = ref(null)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

const validateOldPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('Please input old password'))
  } else {
    validateMemberOldPassword({ oldPassword: value })
      .then(() => {
        submitPasswordDisabled.value = false
        callback()
      })
      .catch((error) => {
        callback(new Error(error.msg))
      })
  }
}
const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    submitPasswordDisabled.value = true
    callback(new Error('Please input new password'))
  } else {
    if (value.length < 3) {
      submitPasswordDisabled.value = true
      callback(new Error('New password length must be over 3'))
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
    callback(new Error('Please input password again'))
  } else {
    if (value !== passwordForm.newPassword) {
      submitPasswordDisabled.value = true
      callback(new Error('Two password inputed are not same'))
    } else {
      submitPasswordDisabled.value = false
      callback()
    }
  }
}

const passwordFormRules = reactive({
  oldPassword: [
    { trigger: ['change', 'blur'], validator: validateOldPassword },
  ],
  newPassword: [
    { trigger: ['change', 'blur'], validator: validateNewPassword },
  ],
  checkPassword: [
    { trigger: ['change', 'blur'], validator: validateCheckPassword },
  ],
})

const onUpdatePassword = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return ElMessage.error('Password form error')
    }
    submitPasswordLoading.value = true
    updatePassword(passwordForm)
      .then(() => {
        ElMessage.success('Update password success')
      })
      .catch((error) => {
        ElMessage.error('Update password error')
        console.error('Update password error', error)
      })
      .finally(() => {
        submitPasswordLoading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
.card-header {
  text-align: center;
}
</style>