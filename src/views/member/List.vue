<template>
  <div class="app-container">
    <div class="filter-container" v-permission="['member:list']">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getMemberList()"></el-button>
          <el-button type="primary" icon="plus" circle @click="showAddMemberDialog"></el-button>
        </el-form-item>
        <el-form-item label="Username" prop="member.username">
          <el-input v-model="searchForm.member.username"></el-input>
        </el-form-item>
        <el-form-item label="Status" prop="member.status">
          <el-select v-model="searchForm.member.status" clearable>
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
          <el-select v-model="searchForm.memberData.gender" clearable>
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
          <el-select v-model="searchForm.role.id" clearable>
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
            :disabled="restSearchDisabled || !searched || allEmpty(searchForm, ['currentPage', 'pageSize'])"
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

    <el-dialog
      v-model="dialogMemberVisible"
      :title="dialogMemberStatusMap[dialogMemberStatus].title"
      destroy-on-close
    >
      <el-form
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
          <el-button @click="dialogMemberVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(memberFormRef)">Reset</el-button>
          <el-button
            type="primary"
            :loading="submitMemberLoading"
            :disabled="submitMemberDisabled"
            @click="dialogMemberStatusMap[dialogMemberStatus].submitAction(memberFormRef)"
          >Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpdateMemberRoleVisible" title="Update Member Role" destroy-on-close>
      <el-form
        ref="memberRoleFormRef"
        :model="memberRoleForm"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="Old Role" prop="role.name">
          <el-input v-model="memberRoleForm.role.name" disabled />
        </el-form-item>
        <el-form-item label="New Role">
          <el-cascader
            :options="roleTree"
            :props="roleProps"
            @change="handleRoleChange"
            filterable
          />
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
import { resetForm, allEmpty } from 'utils/form'
import { list2Tree } from 'utils/tree'
import { memberStatusMap, memberLockMap, memberGenderMap } from 'utils'
import { list as listMember, detail as getMemberDetail, updateDetail as updateMemberDetail, add as addMember, remove as removeMember } from 'api/member'
import { list as listRole, updateMemberRole } from 'api/role'

const store = useStore()
const member = computed(() => store.getters.member.member)

const memberListLoading = ref(false)
const memberList = ref([])
const roleList = ref([])
const roleTree = ref([])
const roleProps = {
  value: 'id',
  label: 'name',
  checkStrictly: true,
}

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

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)

const onSearch = () => {
  searched.value = true
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
  searched.value = false
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
  listRole().then(response => {
    roleList.value = response.data.list
    roleTree.value = list2Tree(response.data.list)
    console.debug('roleTree', roleTree.value)
  }).catch((error) => {
    ElMessage.error(`getRoleList error: ${JSON.stringify(error)}`)
  })
}

const getMemberList = (successCallback = null, errorCallback = null) => {
  memberListLoading.value = true
  onSearchLoading.value = true
  onSearchDisabled.value = true
  searchForm.currentPage = page.currentPage
  searchForm.pageSize = page.pageSize
  listMember(searchForm).then(response => {
    memberList.value = response.data.list
    page.totalData = response.data.total
    page.currentPage = response.data.currentPage
    page.pageSize = response.data.pageSize
    page.totalPage = response.data.totalPage
    successCallback && successCallback()
  }).catch((error) => {
    errorCallback && errorCallback()
    ElMessage.error(`getMemberList error: ${JSON.stringify(error)}`)
  }).finally(() => {
    memberListLoading.value = false
    onSearchLoading.value = false
    onSearchDisabled.value = false
  })
}

onMounted(async () => {
  await getRoleList()
  await getMemberList()
})

const dialogMemberStatusMap = {
  add: {
    title: 'Add Member',
    submitAction: (formEl) => onAddMember(formEl),
  },
  update: {
    title: 'Update Member',
    submitAction: (formEl) => onUpdateMember(formEl),
  }
}
const dialogMemberStatus = ref('add')
const dialogMemberVisible = ref(false)
const submitMemberLoading = ref(false)
const submitMemberDisabled = ref(false)

const memberFormRef = ref(null)
const defaultMemberForm = () => {
  return {
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
  }
}
const memberForm = reactive(defaultMemberForm())

// ------- add member -------
const showAddMemberDialog = () => {
  Object.assign(memberForm, defaultMemberForm())
  dialogMemberStatus.value = 'add'
  dialogMemberVisible.value = true
}

const onAddMember = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  addMember(memberForm).then(() => {
    getMemberList()
    dialogMemberVisible.value = false
    ElMessage.success('add member success')
  }).catch((error) => {
    ElMessage.error(`add member error: ${JSON.stringify(error)}`)
  }).finally(() => {
    submitMemberLoading.value = false
    submitMemberDisabled.value = false
  })
}

// ------- update member -------
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
  Object.assign(memberForm, defaultMemberForm())
  getMemberDetail({ memberId: memberId }).then(response => {
    memberForm.member.id = response.data.member.member_id
    memberForm.member.username = response.data.member.username
    memberForm.member.status = response.data.member.status
    memberForm.member.lock = response.data.member.lock
    memberForm.memberData.avatar = response.data.memberData.avatar
    memberForm.memberData.nickname = response.data.memberData.nickname
    memberForm.memberData.gender = response.data.memberData.gender
    dialogMemberStatus.value = 'update'
    dialogMemberVisible.value = true
  }).catch((error) => {
    ElMessage.error(`get member detail error: ${JSON.stringify(error)}`)
  })
}

const onUpdateMember = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  updateMemberDetail(memberForm).then(() => {
    getMemberList()
    dialogMemberVisible.value = false
    ElMessage.success('update member detail success')
  }).catch((error) => {
    ElMessage.error(`update member detail error: ${JSON.stringify(error)}`)
  }).finally(() => {
    submitMemberLoading.value = false
    submitMemberDisabled.value = false
  })
}

// ------- update member role -------
const submitMemberRoleLoading = ref(false)
const submitMemberRoleDisabled = ref(false)
const dialogUpdateMemberRoleVisible = ref(false)

const defaultMemberRoleForm = () => {
  return {
    memberId: null,
    role: {
      id: null,
      name: '',
    }
  }
}
const memberRoleFormRef = ref(null)
const memberRoleForm = reactive(defaultMemberRoleForm())

const showUpdateMemberRoleDialog = (memberId) => {
  Object.assign(memberRoleForm, defaultMemberRoleForm())
  getMemberDetail({ memberId: memberId }).then(response => {
    memberRoleForm.memberId = response.data.member.id
    memberRoleForm.role.id = response.data.role.id
    memberRoleForm.role.name = response.data.role.name
    dialogUpdateMemberRoleVisible.value = true
  }).catch((error) => {
    ElMessage.error(`get member detail error: ${JSON.stringify(error)}`)
  })
}

const handleRoleChange = (value) => {
  memberRoleForm.role.id = Object.values(value).pop()
}

const onUpdateMemberRole = () => {
  submitMemberRoleLoading.value = true
  submitMemberRoleDisabled.value = true
  updateMemberRole(memberRoleForm).then(() => {
    getMemberList()
    dialogUpdateMemberRoleVisible.value = false
    ElMessage.success('update member role success')
  }).catch((error) => {
    ElMessage.error(`update member role error: ${JSON.stringify(error)}`)
  }).finally(() => {
    submitMemberRoleLoading.value = false
    submitMemberRoleDisabled.value = false
  })
}

// ------- delete member -------
const onDelete = (memberId) => {
  removeMember({ memberId: memberId }).then(() => {
    getMemberList()
    ElMessage.success('delete success')
  }).catch((error) => {
    ElMessage.error(`delete error: ${JSON.stringify(error)}`)
  })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>