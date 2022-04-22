<template>
  <div class="app-container">
    <div class="filter-container" v-permission="'member:list'">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getMemberList"></el-button>
          <el-button type="primary" icon="plus" circle v-permission="'member:add'" @click="showAddMemberDialog">
          </el-button>
        </el-form-item>
        <el-form-item label="Username" prop="member.username">
          <el-input v-model="searchForm.member.username" />
        </el-form-item>
        <el-form-item label="Status" prop="member.status">
          <el-select v-model="searchForm.member.status" clearable>
            <el-option v-for="item in memberStatusMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.member.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname" prop="memberData.nickname">
          <el-input v-model="searchForm.memberData.nickname" />
        </el-form-item>
        <el-form-item label="Gender" prop="memberData.gender">
          <el-select v-model="searchForm.memberData.gender" clearable>
            <el-option v-for="item in memberGenderMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.memberData.gender" />
          </el-select>
        </el-form-item>
        <el-form-item label="RoleName" prop="role.name">
          <el-input v-model="searchForm.role.name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" circle :loading="onSearchLoading" :disabled="onSearchDisabled"
            @click="onSearch"></el-button>
          <el-button type="danger" icon="refresh-left" circle :loading="restSearchLoading" :disabled="
            restSearchDisabled ||
            !searched ||
            allEmpty(searchForm, ['currentPage', 'pageSize'])
          " @click="restSearch(searchFormRef)"></el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table v-loading="memberListLoading" :data="memberList" border highlight-current-row style="width: 100%">
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
          <el-tag size="small" v-if="memberGenderMap.length > 0"
            :type="memberGenderMap[scope.row.memberData.gender].color">
            {{ memberGenderMap[scope.row.memberData.gender].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" prop="member.status" width="100">
        <template #default="scope">
          <el-tag size="small" v-if="memberStatusMap.length > 0" :type="memberStatusMap[scope.row.member.status].color">
            {{ memberStatusMap[scope.row.member.status].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Lock" prop="member.lock" width="100">
        <template #default="scope">
          <el-tag size="small" v-if="memberLockMap.length > 0" :type="memberLockMap[scope.row.member.lock].color">
            {{ memberLockMap[scope.row.member.lock].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="RoleName" width="130">
        <template #default="scope">
          <template v-for="role in scope.row.roleList" :key="role.id">
            <el-tag size="small" effect="plain" class="mr-1">
              {{ role.name }}
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="LoginAt / RegisterAt" width="180">
        <template #default="scope">
          <div>{{ scope.row.member.logined_at || 'None' }}</div>
          <div>{{ scope.row.member.created_at }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" v-permission:or="['member:update', 'member:remove']">
        <template #default="scope">
          <template v-if="scope.row.member.member_id !== member.id">
            <el-space wrap>
              <span v-permission="'member:update'">
                <el-button @click="
                  showUpdateMemberRoleDialog(scope.row.member.member_id)
                ">Update Role</el-button>
                <el-button @click="showUpdateMemberDialog(scope.row.member.member_id)">Update Member</el-button>
              </span>
              <span v-permission="'member:remove'" v-if="scope.row.member.lock === 0">
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                  :title="`Are you sure to remove this member: ${scope.row.member.username}?`"
                  @confirm="onRemove(scope.row.member.member_id)">
                  <template #reference>
                    <el-button>Remove</el-button>
                  </template>
                </el-popconfirm>
              </span>
            </el-space>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, sizes, prev, pager, next, jumper" v-model:currentPage="page.currentPage"
      v-model:page-size="page.pageSize" :page-sizes="page.pageSizes" :total="page.totalData"
      @size-change="handleSizeChange" @current-change="handleCurrentChange">
    </el-pagination>

    <el-dialog v-model="dialogMemberVisible" :title="dialogMemberStatusMap[dialogMemberStatus].title" destroy-on-close>
      <el-form ref="memberFormRef" :model="memberForm" :rules="memberFormRules" status-icon label-position="left"
        label-width="100px">
        <el-form-item label="Username" prop="member.username">
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="memberForm.member.username" />
        </el-form-item>
        <el-form-item label="Password" prop="member.password">
          <el-input type="text" autocomplete="off" prefix-icon="lock" v-model="memberForm.member.password" />
        </el-form-item>
        <el-form-item label="Status" prop="member.status">
          <el-select v-model="memberForm.member.status">
            <el-option v-for="item in memberStatusMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === memberForm.member.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Lock" prop="member.lock">
          <el-select v-model="memberForm.member.lock">
            <el-option v-for="item in memberLockMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === memberForm.member.lock" />
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname" prop="memberData.nickname">
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="memberForm.memberData.nickname">
            <template #append>
              <el-button icon="refresh-right" @click="getFakeNickname" :loading="getFakeNicknameLoading"
                :disabled="getFakeNicknameDisabled" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Gender" prop="memberData.gender">
          <el-select v-model="memberForm.memberData.gender">
            <el-option v-for="item in memberGenderMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === memberForm.memberData.gender" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogMemberVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(memberFormRef)">Reset</el-button>
          <el-button type="primary" :loading="submitMemberLoading" :disabled="submitMemberDisabled"
            @click="dialogMemberStatusMap[dialogMemberStatus].submitAction(memberFormRef)">Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpdateMemberRoleVisible" title="Update Member Role" destroy-on-close>
      <el-form ref="memberRoleFormRef" :model="memberRoleForm" label-position="left" label-width="110px">
        <el-form-item label="Current Role">
          <template v-for="(role, index) in memberRoleForm.roleList" :key="role.id">
            <el-tag size="small" effect="plain" class="mr-1" closable @close="onRemoveMemberRole(index)">{{ role.name }}
            </el-tag>
          </template>
        </el-form-item>
        <el-form-item label="New Role">
          <el-cascader v-model="roleSelectIdList" :options="roleTree" :props="roleProps" @change="handleRoleChange"
            filterable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitMemberRoleLoading" :disabled="submitMemberRoleDisabled"
            @click="onAddMemberRole">Add</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCloseDialogUpdateMemberRole">Close</el-button>
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
import Pair from 'utils/Pair'
import { list as listMember, detail as getMemberDetail, updateDetail as updateMemberDetail, add as addMember, remove as removeMember, } from 'api/member'
import { list as listRole, addMemberRole, removeMemberRole } from 'api/role'
import { getName as getFakeName } from 'api/fake'

const store = useStore()
const member = computed(() => store.getters.member.member)

const memberStatusMap = ref([])
const memberLockMap = ref([])
const memberGenderMap = ref([])

onMounted(async () => {
  const dataList = await Pair.getValueByKey(['memberStatusMap', 'memberLockMap', 'memberGenderMap'])
  memberStatusMap.value = dataList[0].value
  memberLockMap.value = dataList[1].value
  memberGenderMap.value = dataList[2].value
  await getMemberList()
})

const memberListLoading = ref(false)
const memberList = ref([])
const roleList = ref([])
const roleSelectIdList = ref([])
const roleTree = ref([])
const roleProps = {
  value: 'id',
  label: 'name',
  checkStrictly: true,
}

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)
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
    name: null,
  },
  currentPage: null,
  pageSize: null,
})

const onSearch = () => {
  searched.value = true
  getMemberList()
}

const restSearchLoading = ref(false)
const restSearchDisabled = ref(false)

const restSearch = async (formEl) => {
  searched.value = false
  restSearchLoading.value = true
  restSearchDisabled.value = true
  resetForm(formEl)
  try {
    await getMemberList()
  } finally {
    restSearchLoading.value = false
    restSearchDisabled.value = false
  }
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
  return new Promise((resolve, reject) => {
    listRole()
      .then((response) => {
        roleList.value = response.data.list
        roleTree.value = list2Tree(response.data.list)
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get role list error')
        console.error('Get role list error', error)
        reject(error)
      })
  })
}

const getMemberList = () => {
  return new Promise((resolve, reject) => {
    memberListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    searchForm.currentPage = page.currentPage
    searchForm.pageSize = page.pageSize
    listMember(searchForm)
      .then((response) => {
        memberList.value = response.data.list
        page.totalData = response.data.total
        page.currentPage = response.data.currentPage
        page.pageSize = response.data.pageSize
        page.totalPage = response.data.totalPage
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get member list error')
        console.error('Get member list error', error)
        reject(error)
      })
      .finally(() => {
        memberListLoading.value = false
        onSearchLoading.value = false
        onSearchDisabled.value = false
      })
  })
}

const dialogMemberStatusMap = {
  add: {
    title: 'Add Member',
    submitAction: (formEl) => onAddMember(formEl),
  },
  update: {
    title: 'Update Member',
    submitAction: (formEl) => onUpdateMember(formEl),
  },
}
const dialogMemberStatus = ref('add')
const dialogMemberVisible = ref(false)
const submitMemberLoading = ref(false)
const submitMemberDisabled = ref(false)
const getFakeNicknameLoading = ref(false)
const getFakeNicknameDisabled = ref(false)
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
    },
  }
}
const memberForm = reactive(defaultMemberForm())

// ------- add member -------
const getFakeNickname = () => {
  getFakeNicknameLoading.value = true
  getFakeNicknameDisabled.value = true
  getFakeName()
    .then((response) => {
      memberForm.memberData.nickname = response.data
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

const showAddMemberDialog = async () => {
  Object.assign(memberForm, defaultMemberForm())
  await getRoleList()
  dialogMemberStatus.value = 'add'
  dialogMemberVisible.value = true
}

const onAddMember = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  addMember(memberForm)
    .then(async () => {
      await getMemberList()
      ElMessage.success('Add member success')
      dialogMemberVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Add member error')
      console.error('Add member error', error)
    })
    .finally(() => {
      submitMemberLoading.value = false
      submitMemberDisabled.value = false
    })
}

// ------- update member -------
const validateUsername = (rule, value, callback) => {
  if (!value) {
    submitMemberDisabled.value = true
    callback(new Error('Please input username'))
  } else {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('Username length must be over 3'))
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
      callback(new Error('Password length must be over 3'))
    } else {
      submitMemberDisabled.value = false
      callback()
    }
  }
}
const validateNickname = (rule, value, callback) => {
  if (!value) {
    submitMemberDisabled.value = true
    callback(new Error('Please input nickname'))
  } else {
    if (value.length < 3) {
      submitMemberDisabled.value = true
      callback(new Error('Nickname length must be over 3'))
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
  },
})

const showUpdateMemberDialog = (memberId) => {
  Object.assign(memberForm, defaultMemberForm())
  getMemberDetail({ id: memberId })
    .then((response) => {
      memberForm.member = response.data.member
      memberForm.memberData = response.data.memberData
      dialogMemberStatus.value = 'update'
      dialogMemberVisible.value = true
    })
    .catch((error) => {
      ElMessage.error('Get member detail error')
      console.error('Get member detail error', error)
    })
}

const onUpdateMember = () => {
  submitMemberLoading.value = true
  submitMemberDisabled.value = true
  updateMemberDetail(memberForm)
    .then(async () => {
      await getMemberList()
      ElMessage.success('Update member detail success')
      dialogMemberVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Update member detail error')
      console.error('Update member detail error', error)
    })
    .finally(() => {
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
    roleId: null,
    roleList: [],
  }
}
const memberRoleFormRef = ref(null)
const memberRoleForm = reactive(defaultMemberRoleForm())

const showUpdateMemberRoleDialog = (memberId) => {
  Object.assign(memberRoleForm, defaultMemberRoleForm())
  getMemberDetail({ id: memberId })
    .then(async (response) => {
      memberRoleForm.memberId = response.data.member.id
      memberRoleForm.roleList = response.data.roleList
      await getRoleList()
      dialogUpdateMemberRoleVisible.value = true
    })
    .catch((error) => {
      ElMessage.error('Get member detail error')
      console.error('Get member detail error', error)
    })
}

const handleRoleChange = (value) => {
  if (!value) {
    return
  }
  const roleId = Object.values(value).pop()
  for (let i = 0; i < memberRoleForm.roleList.length; i++) {
    if (memberRoleForm.roleList[i].id === roleId) {
      roleSelectIdList.value = []
      return ElMessage.error('Member already assumed this role')
    }
  }
  memberRoleForm.roleId = roleId
}

let isMemberRoleUpdate = false

const onRemoveMemberRole = (index) => {
  submitMemberRoleLoading.value = true
  submitMemberRoleDisabled.value = true
  const roleId = memberRoleForm.roleList[index].id
  removeMemberRole({ roleId: roleId, memberId: memberRoleForm.memberId })
    .then(() => {
      isMemberRoleUpdate = true
      memberRoleForm.roleList.splice(index, 1)
      ElMessage.success('Remove member role success')
    })
    .catch((error) => {
      ElMessage.error('Remove member role error')
      console.error('Remove member role error', error)
    })
    .finally(() => {
      submitMemberRoleLoading.value = false
      submitMemberRoleDisabled.value = false
    })
}

const onAddMemberRole = () => {
  submitMemberRoleLoading.value = true
  submitMemberRoleDisabled.value = true
  addMemberRole({
    roleId: memberRoleForm.roleId,
    memberId: memberRoleForm.memberId,
  })
    .then((response) => {
      isMemberRoleUpdate = true
      roleSelectIdList.value = []
      memberRoleForm.roleList.push(response.data)
      ElMessage.success('Add member role success')
    })
    .catch((error) => {
      ElMessage.error('Add member role error')
      console.error('Add member role error', error)
    })
    .finally(() => {
      submitMemberRoleLoading.value = false
      submitMemberRoleDisabled.value = false
    })
}

const onCloseDialogUpdateMemberRole = async () => {
  if (isMemberRoleUpdate) {
    isMemberRoleUpdate = false
    await getMemberList()
    dialogUpdateMemberRoleVisible.value = false
  } else {
    dialogUpdateMemberRoleVisible.value = false
  }
}

// ------- remove member -------
const onRemove = (memberId) => {
  removeMember({ id: memberId })
    .then(async () => {
      await getMemberList()
      ElMessage.success('Remove member success')
    })
    .catch((error) => {
      ElMessage.error('Remove member error')
      console.error('Remove member error', error)
    })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>