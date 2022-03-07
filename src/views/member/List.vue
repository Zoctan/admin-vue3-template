<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        type="primary"
        icon="refresh"
        circle
        v-permission="['member:list']"
        @click="refreshMemberList"
      ></el-button>
      <el-button
        type="success"
        icon="plus"
        circle
        v-permission="['member:add']"
        @click="showAddMemberDialog"
      ></el-button>
      <el-form :inline="true" :model="formInline">
        <template v-permission="['member:search']">
          <el-form-item label="Username">
            <el-input v-model="search.member.username" placeholder="username"></el-input>
          </el-form-item>
          <el-form-item label="Nickname">
            <el-input v-model="search.memberData.nickname" placeholder="nickname"></el-input>
          </el-form-item>
          <el-form-item label="Gender">
            <el-select v-model="search.memberData.gender" placeholder="gender">
              <template v-for="gender in genderList" :key="name">
                <el-option :label="gender.name" :value="gender.name" />
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="RoleName">
            <el-select v-model="search.role.name" placeholder="role name">
              <template v-for="role in roleList" :key="name">
                <el-option :label="role.name" :value="role.name" />
              </template>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="info" icon="search" circle @click="onSearch"></el-button>
          </el-form-item>
        </template>
      </el-form>
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
        <template v-if="scope.row.id !== member.id" #default>
          <el-button
            type="warning"
            size="small"
            v-permission="['member:update']"
            @click="onShowUpdateDialog(scope.row.id)"
          >Update</el-button>
          <el-button
            type="danger"
            size="small"
            v-permission="['member:delete']"
            @click="onDelete(scope.row.id)"
          >Delete</el-button>
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

    <el-dialog v-model="dialogMemberFormVisible" title="Update Member">
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
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { resetForm } from '@/utils/form'
import { list as listMember, updateDetail } from '@/api/member'

const store = useStore()

const member = computed(() => store.getters.member.member)

const memberList = ref([])
const roleList = ref([])

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
  return (page.currentPage - 1) * page.pageSize.size + index + 1
}

/**
     * 获取所有角色
     */
const getRoleList = () => {
  getRoleList().then(response => {
    roleList.value = response.data.list
  }).catch((error) => {
    return ElMessage.error(`getRoleList error: ${error.msg}`)
  })
}

const getMemberList = () => {
  listMember(page).then(response => {
    memberList.value = response.data.list
    page.total = response.data.total
  }).catch((error) => {
    return ElMessage.error(`getMemberList error: ${error.msg}`)
  })
}

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

// ------- update member -------
const submitMemberLoading = ref(false)
const submitMemberDisabled = ref(false)
const dialogMemberFormVisible = ref(false)

const memberFormRef = ref(null)

const memberForm = reactive({
  nickname: memberData.value.nickname,
  gender: memberData.value.gender,
})

// ------- member -------

const searchBy = ()=> {
  this.btnLoading = true
  this.listLoading = true
  this.search.page = this.listQuery.page
  this.search.size = this.listQuery.size
  search(this.search).then(response => {
    this.memberList = response.data.list
    this.total = response.data.total
    this.listLoading = false
    this.btnLoading = false
  }).catch(res => {
    this.$message.error('搜索失败')
  })
}
/**
 * 显示添加成员对话框
 */
const showAddMemberDialog = ()=> {
  // 显示新增对话框
  this.dialogFormVisible = true
  this.dialogStatus = 'add'
  this.tmpMember.email = ''
  this.tmpMember.name = ''
  this.tmpMember.password = ''
}
/**
 * 添加成员
 */
const addMember = ()=> {
  this.$refs.tmpMember.validate(valid => {
    if (valid && this.isUniqueDetail(this.tmpMember)) {
      this.btnLoading = true
      register(this.tmpMember).then(() => {
        this.$message.success('添加成功')
        this.getMemberList()
        this.dialogFormVisible = false
        this.btnLoading = false
      }).catch(res => {
        this.$message.error('添加账户失败')
        this.btnLoading = false
      })
    }
  })
}
/**
 * 显示修改成员对话框
 * @param index 成员下标
 */
const showUpdateMemberDialog  = (index)=> {
  this.dialogFormVisible = true
  this.dialogStatus = 'update'
  this.tmpMember.memberId = this.memberList[index].id
  this.tmpMember.email = this.memberList[index].email
  this.tmpMember.name = this.memberList[index].name
  this.tmpMember.password = ''
  this.tmpMember.roleId = this.memberList[index].roleId
}
/**
 * 更新成员
 */
const updateMember = ()=> {
  updateMember(this.tmpMember).then(() => {
    this.$message.success('更新成功')
    this.getMemberList()
    this.dialogFormVisible = false
  }).catch(res => {
    this.$message.error('更新失败')
  })
}
/**
 * 显示修改成员角色对话框
 * @param index 成员下标
 */
const showUpdateMemberRoleDialog = (index)=> {
  this.dialogFormVisible = true
  this.dialogStatus = 'updateRole'
  this.tmpMember.memberId = this.memberList[index].id
  this.tmpMember.email = this.memberList[index].email
  this.tmpMember.name = this.memberList[index].name
  this.tmpMember.password = ''
  this.tmpMember.roleId = this.memberList[index].roleId
}
/**
 * 更新成员角色
 */
const updateMemberRole = ()=> {
  updateMemberRole(this.tmpMember).then(() => {
    this.$message.success('更新成功')
    this.getMemberList()
    this.dialogFormVisible = false
  }).catch(res => {
    this.$message.error('更新失败')
  })
}
/**
 * 成员信息是否唯一
 * @param member 成员
 */
const isUniqueDetail = (member)=> {
  for (let i = 0; i < this.memberList.length; i++) {
    if (this.memberList[i].name === member.name) {
      this.$message.error('账户名已存在')
      return false
    }
    if (this.memberList[i].email === member.email) {
      this.$message.error('邮箱已存在')
      return false
    }
  }
  return true
}
/**
 * 删除成员
 * @param index 成员下标
 */
const removeMember = (index)=> {
  this.$confirm('删除该账户？', '警告', {
    confirmButtonText: '是',
    cancelButtonText: '否',
    type: 'warning'
  }).then(() => {
    const id = this.memberList[index].id
    remove(id).then(() => {
      this.$message.success('删除成功')
      this.getMemberList()
    })
  }).catch(() => {
    this.$message.info('已取消删除')
  })
}

const validateEmail = (rule, value, callback) => {
  if (!isValidateEmail(value)) {
    callback(new Error('邮箱格式错误'))
  } else {
    callback()
  }
}
const validateName = (rule, value, callback) => {
  if (value.length < 3) {
    callback(new Error('账户名长度必须 ≥ 3'))
  } else {
    callback()
  }
}
const validatePassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('密码长度必须 ≥ 6'))
  } else {
    callback()
  }
}
</script>
