<template>
  <div class="app-container">
    <div class="filter-container" v-permission="['member:list']">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" icon="refresh" circle @click="getMemberList"></el-button>
        </el-form-item>
        <el-form-item label="Username">
          <el-input v-model="searchForm.member.username"></el-input>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.member.status">
            <template v-for="(item, key, index) in memberStatusMap" :key="key">
              <el-option :label="item" :value="key" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname">
          <el-input v-model="searchForm.memberData.nickname"></el-input>
        </el-form-item>
        <el-form-item label="Gender">
          <el-select v-model="searchForm.memberData.gender">
            <template v-for="(item, key, index) in memberGenderMap" :key="key">
              <el-option :label="item" :value="key" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="RoleName">
          <el-select v-model="searchForm.role.id">
            <template v-for="role in roleList" :key="role.id">
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
    </div>

    <el-table :data="memberList" border highlight-current-row style="width: 100%">
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
          <el-tag size="small">{{ memberGenderMap[scope.row.memberData.gender] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" prop="member.status" width="100">
        <template #default="scope">
          <el-tag
            size="small"
            :type="scope.row.member.status === 1 ? 'success' : 'danger'"
          >{{ memberStatusMap[scope.row.member.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="RegisterAt" prop="member.created_at" width="180" />
      <el-table-column label="LoginAt" prop="member.logined_at" width="180" />
      <el-table-column label="RoleName" prop="role.name" width="130" />
      <el-table-column
        fixed="right"
        label="Operations"
        v-permission="{ joint: 'or', list: ['member:update', 'member:delete'] }"
      >
        <template #default="scope">
          <template v-if="scope.row.member.member_id !== member.id">
            <span v-permission="['member:update']">
              <el-button @click="showUpdateRoleDialog(scope.row.member.member_id)">Update Role</el-button>
              <el-button @click="showUpdateMemberDialog(scope.row.member.member_id)">Update Member</el-button>
            </span>
            <span v-permission="['member:delete']">
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
import { memberGenderMap, memberStatusMap } from '@/utils'
import { list as listMember, updateDetail, remove as removeMember } from '@/api/member'
import { listRole, updateMemberRole } from '@/api/role'

const store = useStore()

const member = computed(() => store.getters.member.member)

const memberList = ref([])
const roleList = ref([])

const searchLoading = ref(false)
const searchDisabled = ref(false)

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
const onDelete = (memberId) => {
  removeMember({ memberId: memberId }).then(() => {
    ElMessage.success('delete success')
    getMemberList()
  }).catch((error) => {
    ElMessage.error(`delete error: ${error.msg}`)
  })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>