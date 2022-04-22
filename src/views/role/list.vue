<template>
  <div class="app-container">
    <div class="filter-container" v-permission="'role:list'">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="info" icon="menu" @click="dialogRuleVisible = true">Rule Manage</el-button>
          <el-button type="success" icon="refresh" circle @click="getRoleList"></el-button>
          <el-button type="primary" icon="plus" circle v-permission="'role:add'" @click="showAddRoleDialog"></el-button>
        </el-form-item>
        <el-form-item label="RoleName" prop="role.name">
          <el-input v-model="searchForm.role.name" />
        </el-form-item>
        <el-form-item label="Has All Rule" prop="role.has_all_rule">
          <el-select v-model="searchForm.role.has_all_rule" clearable>
            <el-option v-for="item in roleHasAllRuleMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.role.has_all_rule" />
          </el-select>
        </el-form-item>
        <el-form-item label="Lock" prop="role.lock">
          <el-select v-model="searchForm.role.lock" clearable>
            <el-option v-for="item in roleLockMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.role.lock" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" circle :loading="onSearchLoading" :disabled="onSearchDisabled"
            @click="onSearch"></el-button>
          <el-button type="danger" icon="refresh-left" circle :loading="restSearchLoading"
            :disabled="restSearchDisabled || !searched || allEmpty(searchForm, ['currentPage', 'pageSize'])"
            @click="restSearch(searchFormRef)"></el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table v-loading="roleListLoading" :data="roleList" border highlight-current-row style="width: 100%">
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Name" prop="name" width="150" />
      <el-table-column label="HasAllRule" prop="has_all_rule" width="110">
        <template #default="scope">
          <el-tag size="small" v-if="roleHasAllRuleMap.length > 0"
            :type="roleHasAllRuleMap[scope.row.has_all_rule].color">
            {{ roleHasAllRuleMap[scope.row.has_all_rule].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Lock" prop="lock" width="100">
        <template #default="scope">
          <el-tag size="small" v-if="roleLockMap.length > 0" :type="roleLockMap[scope.row.lock].color">
            {{ roleLockMap[scope.row.lock].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="UpdatedAt / CreatedAt" width="200">
        <template #default="scope">
          <div>{{ scope.row.updated_at || 'None' }}</div>
          <div>{{ scope.row.created_at }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" v-permission:or="['role:detail', 'role:update', 'role:remove']">
        <template #default="scope">
          <template
            v-if="member.roleList.filter(role => role.id === scope.row.id) !== null && scope.row.name !== 'SuperAdmin'">
            <el-space wrap>
              <span v-permission="'role:update'">
                <el-button @click="showUpdateRoleDialog(scope.row.id)">Update</el-button>
              </span>
              <span v-permission="'role:remove'">
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                  :title="`Are you sure to remove this role: ${scope.row.name}?`" @confirm="onRemove(scope.row.id)"
                  :diabled="scope.row.lock === 0">
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
      @size-change="handleSizeChange" @current-change="handleCurrentChange"></el-pagination>

    <el-dialog v-model="dialogRoleVisible" :title="dialogRoleStatusMap[dialogRoleStatus].title" destroy-on-close>
      <el-form ref="roleFormRef" :model="roleForm" status-icon label-position="left" label-width="110px">
        <el-form-item label="RoleName" prop="role.name" required>
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="roleForm.role.name" />
        </el-form-item>
        <el-form-item label="ParentRole">
          <el-cascader v-model="parentRoleSelectIdList" :options="roleTree" :props="roleProps"
            @change="handleParentRoleChange" filterable clearable />
        </el-form-item>
        <el-form-item label="Has All Rule" prop="role.has_all_rule" required>
          <el-select v-model="roleForm.role.has_all_rule">
            <el-option v-for="item in roleHasAllRuleMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === roleForm.role.has_all_rule" />
          </el-select>
        </el-form-item>
        <el-form-item label="Lock" prop="role.lock" required>
          <el-select v-model="roleForm.role.lock">
            <el-option v-for="item in roleLockMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === roleForm.role.lock" />
          </el-select>
        </el-form-item>
        <el-form-item label="Rule" v-if="roleForm.role.has_all_rule === 0">
          <el-tree ref="ruleTreeRef" :data="ruleTree" show-checkbox node-key="id"
            :default-checked-keys="roleForm.ruleList" :props="defaultRuleProps" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogRoleVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(roleFormRef)">Reset</el-button>
          <el-button type="primary" :loading="submitRoleLoading" :disabled="submitRoleDisabled"
            @click="dialogRoleStatusMap[dialogRoleStatus].submitAction(roleFormRef)">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogRuleVisible" title="Rule Manage" destroy-on-close>
      <template #default>
        <el-input v-model="filterRuleText" placeholder="Filter keyword" />
        <el-tree ref="ruleTreeRef" :data="ruleTree" node-key="id" :props="defaultRuleProps"
          :filter-node-method="filterRuleNode" :expand-on-click-node="false">
          <template #default="{ node }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span>
                <el-button type="text" @click="showAddRuleDialog(node)" v-if="node.data.parent_id === 0">Add</el-button>
                <el-button type="text" @click="showUpdateRuleDialog(node)">Update</el-button>
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                  title="Are you sure to remove this rule?" @confirm="onRemoveRule(node)">
                  <template #reference>
                    <el-button :loading="submitRuleLoading" :disabled="submitRuleDisabled" type="text">Remove
                    </el-button>
                  </template>
                </el-popconfirm>
              </span>
            </span>
          </template>
        </el-tree>
        <el-dialog v-model="innerDialogRuleVisible" width="30%"
          :title="innerDialogRuleStatusMap[innerDialogRuleStatus].title" append-to-body>
          <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-position="left" label-width="100px">
            <el-form-item label="Description" prop="description" required>
              <el-input type="text" autocomplete="off" v-model="ruleForm.description" />
            </el-form-item>
            <el-form-item :label="ruleForm.parent_id === 0 || ruleForm.parent_id === null ? 'Resource' : 'Action'"
              prop="permission" required>
              <el-input type="text" autocomplete="off" v-model="ruleForm.permission" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="innerDialogRuleVisible = false">Cancel</el-button>
              <el-button type="danger" @click="resetForm(ruleFormRef)">Reset</el-button>
              <el-button type="primary" :loading="submitRuleLoading" :disabled="submitRuleDisabled"
                @click="innerDialogRuleStatusMap[innerDialogRuleStatus].submitAction(ruleFormRef)">Confirm</el-button>
            </span>
          </template>
        </el-dialog>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogRuleVisible = false">Close</el-button>
          <el-button type="primary" @click="showAddRuleDialog()">Add</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { resetForm, allEmpty } from 'utils/form'
import { list2Tree, tree2List } from 'utils/tree'
import Pair from 'utils/Pair'
import { add as addRole, list as listRole, listParent as listParentRole, detail as getRoleDetail, update as updateRole, remove as removeRole } from 'api/role'
import { add as addRule, list as listRule, update as updateRule, removeList as removeRuleList } from 'api/rule'

const store = useStore()
const member = computed(() => store.getters.member)

const roleHasAllRuleMap = ref([])
const roleLockMap = ref([])

onMounted(async () => {
  const dataList = await Pair.getValueByKey(['roleHasAllRuleMap', 'roleLockMap'])
  roleHasAllRuleMap.value = dataList[0].value
  roleLockMap.value = dataList[1].value
  await getRoleList()
})

const ruleList = ref([])
const roleListLoading = ref(false)
const roleList = ref([])
const roleTree = ref([])
const roleProps = {
  value: 'id',
  label: 'name',
  checkStrictly: true,
}
const parentRoleSelectIdList = ref([])

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)
const restSearchLoading = ref(false)
const restSearchDisabled = ref(false)
const searchFormRef = ref(null)
const searchForm = reactive({
  // search child role by member role id list
  parentIdList: member.value.roleList.find(role => role.name === 'SuperAdmin') ? null : member.value.roleList.map(role => role.id),
  role: {
    id: null,
    name: null,
    has_all_rule: null,
    lock: null,
  },
  currentPage: null,
  pageSize: null,
})

const onSearch = () => {
  searched.value = true
  getRoleList()
}

const restSearch = async (formEl) => {
  searched.value = false
  restSearchLoading.value = true
  restSearchDisabled.value = true
  resetForm(formEl)
  try {
    await getRoleList()
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
  getRoleList()
}

const handleCurrentChange = (currentPage) => {
  page.currentPage = currentPage
  getRoleList()
}

const getIndex = (index) => {
  return (page.currentPage - 1) * page.pageSize + index + 1
}

const dialogRuleVisible = ref(false)
const submitRuleLoading = ref(false)
const submitRuleDisabled = ref(false)
const filterRuleText = ref('')
const innerDialogRuleVisible = ref(false)
const ruleTreeRef = ref(null)
const ruleTree = ref([])
const defaultRuleProps = {
  children: 'children',
  label: 'description',
}
const innerDialogRuleStatusMap = {
  add: {
    title: 'Add Rule',
    submitAction: (formEl) => onAddRule(formEl),
  },
  update: {
    title: 'Update Rule',
    submitAction: (formEl) => onUpdateRule(formEl),
  }
}
const innerDialogRuleStatus = ref('add')
const defaultRuleForm = () => {
  return {
    id: null,
    parent_id: 0,
    description: null,
    permission: null,
  }
}
const ruleFormRef = ref(null)
const ruleForm = reactive(defaultRuleForm())

const getRuleList = () => {
  return new Promise((resolve, reject) => {
    listRule()
      .then((response) => {
        ruleList.value = response.data
        ruleTree.value = list2Tree(response.data)
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get rule list error')
        console.error('Get rule list error', error)
        reject(error)
      })
  })
}

watch(filterRuleText, (value) => {
  if (ruleTreeRef.value) {
    ruleTreeRef.value.filter(value)
  }
})

const filterRuleNode = (value, data) => {
  if (!value) return true
  return data.description.includes(value)
}

const showAddRuleDialog = (node) => {
  Object.assign(ruleForm, defaultRuleForm())
  if (node) {
    ruleForm.parent_id = node.data.id
  }
  innerDialogRuleStatus.value = 'add'
  innerDialogRuleVisible.value = true
}

const onAddRule = () => {
  submitRuleLoading.value = true
  submitRuleDisabled.value = true
  addRule(ruleForm)
    .then(async () => {
      await getRuleList()
      ElMessage.success('Add rule success')
      innerDialogRuleVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Add rule error')
      console.error('Add rule error', error)
    })
    .finally(() => {
      submitRuleLoading.value = false
      submitRuleDisabled.value = false
    })
}

const showUpdateRuleDialog = async (node) => {
  Object.assign(ruleForm, defaultRuleForm())
  Object.assign(ruleForm, node.data)
  await getRuleList()
  innerDialogRuleStatus.value = 'update'
  innerDialogRuleVisible.value = true
}

const onUpdateRule = () => {
  submitRuleLoading.value = true
  submitRuleDisabled.value = true
  updateRule(ruleForm)
    .then(async () => {
      await getRuleList()
      ElMessage.success('Update rule success')
      innerDialogRuleVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Update rule error')
      console.error('Update rule error', error)
    })
    .finally(() => {
      submitRuleLoading.value = false
      submitRuleDisabled.value = false
    })
}

const onRemoveRule = (node) => {
  submitRuleLoading.value = true
  submitRuleDisabled.value = true
  const data = node.data
  let _ruleList = [data]
  if (data.parent_id === 0 && data.children && data.children.length > 0) {
    _ruleList = tree2List(data, (data) => { return { id: data.id } })
  }
  const ruleIdList = _ruleList.map(rule => rule.id)
  removeRuleList({ ruleIdList: ruleIdList })
    .then(async () => {
      await getRuleList()
      ElMessage.success('Remove rule success')
    })
    .catch((error) => {
      ElMessage.error('Remove rule error')
      console.error('Remove rule error', error)
    })
    .finally(() => {
      submitRuleLoading.value = false
      submitRuleDisabled.value = false
    })
}

const getRoleList = () => {
  return new Promise((resolve, reject) => {
    roleListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    searchForm.currentPage = page.currentPage
    searchForm.pageSize = page.pageSize
    listRole(searchForm)
      .then((response) => {
        roleList.value = response.data.list
        roleTree.value = list2Tree(response.data.list)
        page.totalData = response.data.total
        page.currentPage = response.data.currentPage
        page.pageSize = response.data.pageSize
        page.totalPage = response.data.totalPage
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get role list error')
        console.error('Get role list error', error)
        reject(error)
      })
      .finally(() => {
        roleListLoading.value = false
        onSearchLoading.value = false
        onSearchDisabled.value = false
      })
  })
}

const dialogRoleStatusMap = {
  add: {
    title: 'Add Role',
    submitAction: (formEl) => onAddRole(formEl),
  },
  update: {
    title: 'Update Role',
    submitAction: (formEl) => onUpdateRole(formEl),
  }
}
const dialogRoleStatus = ref('add')
const dialogRoleVisible = ref(false)
const submitRoleLoading = ref(false)
const submitRoleDisabled = ref(false)
const defaultRoleForm = () => {
  return {
    role: {
      id: null,
      parent_id: 0,
      name: null,
      has_all_rule: null,
      lock: null,
    },
    ruleList: []
  }
}
const roleFormRef = ref(null)
const roleForm = reactive(defaultRoleForm())

const handleParentRoleChange = (value) => {
  if (!value) {
    roleForm.role.parent_id = 0
    return
  }
  roleForm.role.parent_id = Object.values(value).pop()
}

// ------- add role -------
const showAddRoleDialog = async () => {
  Object.assign(roleForm, defaultRoleForm())
  parentRoleSelectIdList.value = []
  await getRuleList()
  dialogRoleStatus.value = 'add'
  dialogRoleVisible.value = true
}

const onAddRole = () => {
  submitRoleLoading.value = true
  submitRoleDisabled.value = true
  // no parent id
  roleForm.ruleList = ruleTreeRef.value.getCheckedKeys(false).filter(id => id !== 0)
  addRole(roleForm)
    .then(async () => {
      await getRoleList()
      ElMessage.success('Add role success')
      dialogRoleVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Add role error')
      console.error('Add role error', error)
    })
    .finally(() => {
      submitRoleLoading.value = false
      submitRoleDisabled.value = false
    })
}

// ------- update role -------
const showUpdateRoleDialog = async (roleId) => {
  Object.assign(roleForm, defaultRoleForm())
  await getRuleList()
  getRoleDetail({ id: roleId })
    .then((response) => {
      roleForm.role.id = response.data.role.id
      roleForm.role.parent_id = response.data.role.parent_id
      roleForm.role.name = response.data.role.name
      roleForm.role.has_all_rule = response.data.role.has_all_rule
      roleForm.role.lock = response.data.role.lock
      roleForm.ruleList = roleForm.role.has_all_rule === 0 ? response.data.ruleList.map(rule => rule.id) : ruleList.value.map(rule => rule.id)

      dialogRoleStatus.value = 'update'
      if (response.data.role.parent_id === 0) {
        dialogRoleVisible.value = true
      }
      else {
        listParentRole({ parentId: response.data.role.parent_id })
          .then((response) => {
            parentRoleSelectIdList.value = response.data.map(role => role.id).sort()
            dialogRoleVisible.value = true
          })
          .catch((error) => {
            ElMessage.error('List parent role error')
            console.error('List parent role error', error)
          })
      }
    })
    .catch((error) => {
      ElMessage.error('Get role detail error')
      console.error('Get role detail error', error)
    })
}

const onUpdateRole = () => {
  submitRoleLoading.value = true
  submitRoleDisabled.value = true
  // no parent id
  roleForm.ruleList = ruleTreeRef.value.getCheckedKeys(false).filter(key => key !== 0)
  updateRole(roleForm)
    .then(async () => {
      await getRoleList()
      ElMessage.success('Update role success')
      dialogRoleVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Update role error')
      console.error('Update role error', error)
    })
    .finally(() => {
      submitRoleLoading.value = false
      submitRoleDisabled.value = false
    })
}

// ------- remove role -------
const onRemove = (roleId) => {
  removeRole({ id: roleId })
    .then(async () => {
      await getRoleList()
      ElMessage.success('Remove role success')
    })
    .catch((error) => {
      ElMessage.error('Remove role error')
      console.error('Remove role error', error)
    })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>