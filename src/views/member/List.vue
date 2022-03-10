<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        type="primary"
        icon="refresh"
        circle
        v-permission="['member:list']"
        @click="getMemberList"
      ></el-button>
      <template v-permission="['member:list']">
        <el-form :inline="true">
          <el-form-item label="Username">
            <el-input v-model="searchForm.member.username" placeholder="username"></el-input>
          </el-form-item>
          <el-form-item label="Nickname">
            <el-input v-model="searchForm.memberData.nickname" placeholder="nickname"></el-input>
          </el-form-item>
          <el-form-item label="Gender">
            <el-select v-model="searchForm.memberData.gender" placeholder="gender">
              <template v-for="gender in genderList" :key="gender.name">
                <el-option :label="gender.name" :value="gender.value" />
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="RoleName">
            <el-select v-model="searchForm.role.name" placeholder="role name">
              <template v-for="role in roleList" :key="role.name">
                <el-option :label="role.name" :value="role.id" />
              </template>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="info"
              icon="search"
              circle
              :loading="searchLoading"
              :disabled="searchDisabled"
              @click="getMemberList"
            ></el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>

    <el-table :data="memberList" border highlight-current-row style="width: 100%">
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Username" prop="username" width="180" />
      <el-table-column label="Avatar" prop="avatar" width="180" />
      <el-table-column label="Nickname" prop="nickname" width="180" />
      <el-table-column label="Gender" prop="gender" width="180" />
      <el-table-column label="Status" prop="status" width="180" />
      <el-table-column label="Register at" prop="created_at" width="160" />
      <el-table-column label="Login at" prop="logined_at" width="160" />
      <el-table-column label="Role name" prop="role.name" width="120" />
      <el-table-column
        fixed="right"
        label="Operations"
        v-permission="{ joint: 'or', list: ['member:update', 'member:delete'] }"
      >
        <template #default="scope">
          <template v-if="scope.row.id !== member.id">
            <el-button
              type="warning"
              size="small"
              v-permission="['member:update']"
              @click="showUpdateRoleDialog(scope.row.id)"
            >Update</el-button>
            <el-button
              type="warning"
              size="small"
              v-permission="['member:update']"
              @click="showUpdateMemberDialog(scope.row.id)"
            >Update</el-button>
            <el-button
              type="danger"
              size="small"
              v-permission="['member:delete']"
              @click="onDelete(scope.row.id)"
            >Delete</el-button>
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

    <el-dialog v-model="dialogUpdateMemberFormVisible" title="Update Member">
      <el-form
        autocomplete="off"
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberFormRules"
        status-icon
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="Nickname" prop="nickname" required>
          <el-input
            type="text"
            autocomplete="off"
            prefix-icon="user"
            v-model="memberForm.nickname"
            placeholder="please input nickname"
          />
        </el-form-item>
        <el-form-item label="Gender" prop="gender" required>
          <el-radio-group v-model="memberForm.gender">
            <el-radio-button label="0">None</el-radio-button>
            <el-radio-button label="1">Man</el-radio-button>
            <el-radio-button label="2">Female</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogMemberFormVisible = false">Cancel</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm } from '@/utils/form'
import { list as listMember, updateDetail, remove } from '@/api/member'
import { listRole, updateMemberRole } from '@/api/role'

const store = useStore()

const member = computed(() => store.getters.member.member)

const memberList = ref([])
const roleList = ref([])
const genderList = reactive([
  { name: 'None', value: 0 },
  { name: 'Male', value: 1 },
  { name: 'Female', value: 2 },
])

const searchLoading = ref(false)
const searchDisabled = ref(false)

const searchForm = reactive({
  member: {
    username: '',
    status: false,
  },
  memberData: {
    nickname: '',
    gender: '',
  },
  role: {
    name: ''
  }
})

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
  getMemberList(true)
}

const handleCurrentChange = (currentPage) => {
  page.currentPage = currentPage
  getMemberList(true)
}

const getIndex = (index) => {
  return (page.currentPage - 1) * page.pageSize + index + 1
}

const getRoleList = () => {
  listRole().then(response => {
    roleList.value = response.data.list
  }).catch((error) => {
    ElMessage.error(`getRoleList error: ${error.msg}`)
  })
}

const getMemberList = () => {
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
    searchLoading.value = false
    searchDisabled.value = false
  }).catch((error) => {
    searchLoading.value = false
    searchDisabled.value = false
    ElMessage.error(`getMemberList error: ${error.msg}`)
  })
}

onMounted(() => {
  getMemberList()
  getRoleList()
})

// ------- update member -------
const submitMemberLoading = ref(false)
const submitMemberDisabled = ref(false)
const dialogUpdateMemberFormVisible = ref(false)

const memberFormRef = ref(null)

const memberForm = reactive({
  nickname: '',
  gender: '',
})

const showUpdateMemberDialog = (memberId) => {
  dialogUpdateMemberFormVisible.value = true

}

const onUpdateMember = () => {
  updateDetail(memberForm).then(() => {
    ElMessage.success('update success')
  }).catch((error) => {
    ElMessage.error(`updateMemberDetail error: ${error.msg}`)
  })
}

// ------- update member role -------
const dialogUpdateRoleFormVisible = ref(false)

const showUpdateRoleDialog = () => {
  dialogUpdateRoleFormVisible.value = true

}

// ------- delete member -------
const onDelete = (index) => {
  this.$confirm('删除该账户？', '警告', {
    confirmButtonText: '是',
    cancelButtonText: '否',
    type: 'warning'
  }).then(() => {
    const id = memberList[index].id
    remove(id).then(() => {
      ElMessage.success('delete success')
      getMemberList()
    })
  }).catch(() => {
    ElMessage.info('cancel delete')
  })
}
</script>
