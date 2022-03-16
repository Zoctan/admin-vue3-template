<template>
  <div class="app-container">
    <div class="filter-container" v-permission="['member:list']">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getMemberList()"></el-button>
        </el-form-item>
        <el-form-item label="Username" prop="member.username">
          <el-input v-model="searchForm.member.username"></el-input>
        </el-form-item>
        <el-form-item label="Status" prop="member.status">
          <el-select v-model="searchForm.member.status">
            <el-option
              v-for="item in memberStatusMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === searchForm.member.status"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname" prop="memberData.nickname">
          <el-input v-model="searchForm.memberData.nickname"></el-input>
        </el-form-item>
        <el-form-item label="Gender" prop="memberData.gender">
          <el-select v-model="searchForm.memberData.gender">
            <el-option
              v-for="item in memberGenderMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === searchForm.memberData.gender"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="RoleName" prop="role.id">
          <el-select v-model="searchForm.role.id">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="item.id === searchForm.role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="search"
            circle
            :loading="onSearchLoading"
            :disabled="onSearchDisabled"
            @click="onSearch"
          ></el-button>
          <el-button
            type="danger"
            icon="refresh-left"
            circle
            :loading="restSearchLoading"
            :disabled="restSearchDisabled"
            @click="restSearch(searchFormRef)"
          ></el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="memberListLoading"
      :data="memberList"
      border
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Avatar" prop="memberData.avatar" width="85">
        <template #default="scope">
          <el-avatar :size="50" :src="scope.row.memberData.avatar"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="Username" prop="member.username" width="150" />
      <el-table-column label="Nickname" prop="memberData.nickname" width="150" />
      <el-table-column label="Gender" prop="memberData.gender" width="100">
        <template #default="scope">
          <el-tag
            size="small"
            :type="memberGenderMap[scope.row.memberData.gender].color"
          >{{ memberGenderMap[scope.row.memberData.gender].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" prop="member.status" width="100">
        <template #default="scope">
          <el-tag
            size="small"
            :type="memberStatusMap[scope.row.member.status].color"
          >{{ memberStatusMap[scope.row.member.status].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Lock" prop="member.lock" width="100">
        <template #default="scope">
          <el-tag
            size="small"
            :type="memberLockMap[scope.row.member.lock].color"
          >{{ memberLockMap[scope.row.member.lock].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="RoleName" prop="role.name" width="130" />
      <el-table-column label="LoginAt / RegisterAt" width="180">
        <template #default="scope">
          <div>{{ scope.row.member.logined_at }}</div>
          <div>{{ scope.row.member.created_at }}</div>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Operations"
        v-permission="{ joint: 'or', list: ['member:update', 'member:delete'] }"
      >
        <template #default="scope">
          <template v-if="scope.row.member.member_id !== member.id">
            <el-space wrap>
              <span v-permission="['member:update']">
                <el-button
                  @click="showUpdateMemberRoleDialog(scope.row.member.member_id)"
                >Update Role</el-button>
                <el-button @click="showUpdateMemberDialog(scope.row.member.member_id)">Update Member</el-button>
              </span>
              <span v-permission="['member:delete']" v-if="scope.row.member.lock === 0">
                <el-popconfirm
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  icon-color="red"
                  :title="`Are you sure to delete this member: ${scope.row.member.username}?`"
                  @confirm="onDelete(scope.row.member.member_id)"
                >
                  <template #reference>
                    <el-button>Delete</el-button>
                  </template>
                </el-popconfirm>
              </span>
            </el-space>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      v-model:currentPage="page.currentPage"
      v-model:page-size="page.pageSize"
      :page-sizes="page.pageSizes"
      :total="page.totalData"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>

    <el-dialog v-model="dialogUpdateMemberVisible" title="Update Member" destroy-on-close>
      <el-form
        autocomplete="off"
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberFormRules"
        status-icon
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="Username" prop="member.username">
          <el-input
            type="text"
            autocomplete="off"
            prefix-icon="user"
            v-model="memberForm.member.username"
          />
        </el-form-item>
        <el-form-item label="Password" prop="member.password">
          <el-input
            type="text"
            autocomplete="off"
            prefix-icon="lock"
            v-model="memberForm.member.password"
          />
        </el-form-item>
        <el-form-item label="Status" prop="member.status">
          <el-select v-model="memberForm.member.status">
            <el-option
              v-for="item in memberStatusMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === memberForm.member.status"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Lock" prop="member.lock">
          <el-select v-model="memberForm.member.lock">
            <el-option
              v-for="item in memberLockMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === memberForm.member.lock"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname" prop="memberData.nickname">
          <el-input
            type="text"
            autocomplete="off"
            prefix-icon="user"
            v-model="memberForm.memberData.nickname"
          />
        </el-form-item>
        <el-form-item label="Gender" prop="memberData.gender">
          <el-select v-model="memberForm.memberData.gender">
            <el-option
              v-for="item in memberGenderMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === memberForm.memberData.gender"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUpdateMemberVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(memberFormRef)">Reset</el-button>
          <el-button
            type="primary"
            :loading="submitMemberLoading"
            :disabled="submitMemberDisabled"
            @click="onUpdateMember(memberFormRef)"
          >Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpdateMemberRoleVisible" title="Update Member Role" destroy-on-close>
      <el-form
        autocomplete="off"
        ref="memberRoleFormRef"
        :model="memberRoleForm"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="Old Role" prop="role.name">
          <el-input v-model="memberRoleForm.role.name" disabled />
        </el-form-item>
        <el-form-item label="New Role">
          <el-select v-model="memberRoleForm.role.id">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="item.id === memberRoleForm.role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUpdateMemberRoleVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(memberRoleFormRef)">Reset</el-button>
          <el-button
            type="primary"
            :loading="submitMemberRoleLoading"
            :disabled="submitMemberRoleDisabled"
            @click="onUpdateMemberRole(memberRoleFormRef)"
          >Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm } from '@/utils/form'
import { memberStatusMap, memberLockMap, memberGenderMap } from '@/utils'
import { list as listMember, updateDetail, remove as removeMember } from '@/api/member'
import { listRole, updateMemberRole } from '@/api/role'

const store = useStore()

const member = computed(() => store.getters.member.member)

const memberListLoading = ref(false)

const memberList = ref([])
const roleList = ref([])

const searchLoading = ref(false)
const searchDisabled = ref(false)

const searchFormRef = ref(null)

const searchForm = reactive({
  member: {
    username: null,
    status: null,
  },
  memberData: {
    nickname: null,
    gender: null,
  },
  role: {
    id: null
  }
})

const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)

const onSearch = () => {
  onSearchLoading.value = true
  onSearchDisabled.value = true
  const callback = () => {
    onSearchLoading.value = false
    onSearchDisabled.value = false
  }
  getMemberList(callback, callback)
}

const restSearchLoading = ref(false)
const restSearchDisabled = ref(false)

const restSearch = (formEl) => {
  restSearchLoading.value = true
  restSearchDisabled.value = true
  const callback = () => {
    restSearchLoading.value = false
    restSearchDisabled.value = false
  }
  resetForm(formEl)
  getMemberList(callback, callback)
}

const page = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100, 200],
  totalPage: 1,
  prePage: 1,
  nextPage: 1,
  totalData: 0,
})

const handleSizeChange = (pageSize) => {
  page.pageSize = pageSize
  page.currentPage = 1
  getMemberList()
}

const handleCurrentChange = (currentPage) => {
  page.currentPage = currentPage
  getMemberList()
}

const getIndex = (index) => {
  return (page.currentPage - 1) * page.pageSize + index + 1
}

const getRoleList = () => {
  listRole({
    currentPage: 0,
    pageSize: 500,
  }).then(response => {
    roleList.value = response.data.list
  }).catch((error) => {
    ElMessage.error(`getRoleList error: ${error}`)
  })
}

const getMemberList = (successCallback = null, errorCallback = null) => {
  memberListLoading.value = true
  searchLoading.value = true
  searchDisabled.value = true
  searchForm.currentPage = page.currentPage
  searchForm.pageSize = page.pageSize
  listMember(searchForm).then(response => {
    memberList.value = response.data.list
    page.totalData = response.data.total
    page.currentPage = response.data.currentPage
    page.pageSize = response.data.pageSize
    page.totalPage = response.data.totalPage
    memberListLoading.value = false
    searchLoading.value = false
    searchDisabled.value = false
    successCallback && successCallback()
  }).catch((error) => {
    memberListLoading.value = false
    searchLoading.value = false
    searchDisabled.value = false
    errorCallback && errorCallback()
    ElMessage.error(`getMemberList error: ${error}`)
  })
}

onMounted(() => {
  getRoleList()
  getMemberList()
})

// ------- update member -------
const submitMemberLoading = ref(false)
const submitMemberDisabled = ref(false)
const dialogUpdateMemberVisible = ref(false)

const memberFormRef = ref(null)

const memberForm = reactive({
  member: {
    id: null,
    username: null,
    password: null,
    status: null,
    lock: null,
  },
  memberData: {
    avatar: null,
    nickname: null,
    gender: null,
  }
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    submitMemberDisabled.value = true
    callback(new Error('please input username'))
  } else {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('username length must be over 3'))
    } else {
      submitMemberDisabled.value = false
      callback()
    }
  }
}
const validatePassword = (rule, value, callback) => {
  if (value) {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('password length must be over 3'))
    } else {
      submitMemberDisabled.value = false
      callback()
    }
  }
}
const validateNickname = (rule, value, callback) => {
  if (!value) {
    submitMemberDisabled.value = true
    callback(new Error('please input nickname'))
  } else {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('nickname length must be over 3'))
    } else {
      submitMemberDisabled.value = false
      callback()
    }
  }
}

const memberFormRules = reactive({
  member: {
    username: [{ trigger: ['change', 'blur'], validator: validateUsername }],
    password: [{ trigger: ['change', 'blur'], validator: validatePassword }],
  },
  memberData: {
    nickname: [{ trigger: ['change', 'blur'], validator: validateNickname }],
  }
})

const showUpdateMemberDialog = (memberId) => {
  dialogUpdateMemberVisible.value = true
  const member = memberList.value.filter(item => item.member.member_id === memberId)
  memberForm.member.id = member[0].member.member_id
  memberForm.member.username = member[0].member.username
  memberForm.member.status = member[0].member.status
  memberForm.member.lock = member[0].member.lock
  memberForm.memberData.avatar = member[0].memberData.avatar
  memberForm.memberData.nickname = member[0].memberData.nickname
  memberForm.memberData.gender = member[0].memberData.gender
}

const onUpdateMember = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  updateDetail(memberForm).then(() => {
    ElMessage.success('update member detail success')
    getMemberList()
    submitMemberLoading.value = false
    submitMemberDisabled.value = false
    dialogUpdateMemberVisible.value = false
  }).catch((error) => {
    ElMessage.error(`update member detail error: ${error}`)
    submitMemberLoading.value = false
    submitMemberDisabled.value = false
  })
}

// ------- update member role -------
const submitMemberRoleLoading = ref(false)
const submitMemberRoleDisabled = ref(false)
const dialogUpdateMemberRoleVisible = ref(false)

const memberRoleFormRef = ref(null)

const memberRoleForm = reactive({
  memberId: null,
  role: {
    id: null,
    name: '',
  },
})

const showUpdateMemberRoleDialog = (memberId) => {
  dialogUpdateMemberRoleVisible.value = true
  const member = memberList.value.filter(item => item.member.member_id === memberId)
  memberRoleForm.memberId = member[0].member.member_id
  memberRoleForm.role = member[0].role
}

const onUpdateMemberRole = () => {
  submitMemberRoleLoading.value = true
  submitMemberRoleDisabled.value = true
  updateMemberRole(memberRoleForm).then(() => {
    ElMessage.success('update member role success')
    getMemberList()
    submitMemberRoleLoading.value = false
    submitMemberRoleDisabled.value = false
    dialogUpdateMemberRoleVisible.value = false
  }).catch((error) => {
    ElMessage.error(`update member role error: ${error}`)
    submitMemberRoleLoading.value = false
    submitMemberRoleDisabled.value = false
  })
}

// ------- delete member -------
const onDelete = (memberId) => {
  removeMember({ memberId: memberId }).then(() => {
    ElMessage.success('delete success')
    getMemberList()
  }).catch((error) => {
    ElMessage.error(`delete error: ${error}`)
  })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>