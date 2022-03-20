<template>
  <div class="app-container">
    <div class="filter-container" v-permission="['role:list']">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getRoleList()"></el-button>
          <el-button type="primary" icon="plus" circle @click="showAddRoleDialog"></el-button>
          <el-button type="info" icon="menu" @click="dialogRuleVisible = true">Rule Manage</el-button>
        </el-form-item>
        <el-form-item label="RoleName" prop="role.name">
          <el-input v-model="searchForm.role.name"></el-input>
        </el-form-item>
        <el-form-item label="Has All Rule" prop="role.has_all_rule">
          <el-select v-model="searchForm.role.has_all_rule" clearable>
            <el-option
              v-for="item in roleHasAllRuleMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === searchForm.role.has_all_rule"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Lock" prop="role.lock">
          <el-select v-model="searchForm.role.lock" clearable>
            <el-option
              v-for="item in roleLockMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === searchForm.role.lock"
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
      v-loading="roleListLoading"
      :data="roleList"
      border
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Name" prop="name" width="150" />
      <el-table-column label="HasAllRule" prop="has_all_rule" width="110">
        <template #default="scope">
          <el-tag
            size="small"
            :type="roleHasAllRuleMap[scope.row.has_all_rule].color"
          >{{ roleHasAllRuleMap[scope.row.has_all_rule].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Lock" prop="lock" width="100">
        <template #default="scope">
          <el-tag
            size="small"
            :type="roleLockMap[scope.row.lock].color"
          >{{ roleLockMap[scope.row.lock].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="CreatedAt" prop="created_at" width="180" />
      <el-table-column
        fixed="right"
        label="Operations"
        v-permission="{ joint: 'or', list: ['role:detail', 'role:update', 'role:delete'] }"
      >
        <template #default="scope">
          <el-space wrap>
            <span v-permission="['role:update']">
              <el-button
                v-loading.fullscreen.lock="fullscreenLoading"
                @click="showUpdateRoleDialog(scope.row.id)"
              >Update</el-button>
            </span>
            <span v-permission="['role:delete']">
              <el-popconfirm
                confirm-button-text="Yes"
                cancel-button-text="No"
                icon-color="red"
                :title="`Are you sure to delete this role: ${scope.row.name}?`"
                @confirm="onDelete(scope.row.id)"
                :diabled="scope.row.lock === 0"
              >
                <template #reference>
                  <el-button v-loading.fullscreen.lock="fullscreenLoading">Delete</el-button>
                </template>
              </el-popconfirm>
            </span>
          </el-space>
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
      v-model="dialogRoleVisible"
      :title="dialogRoleStatusMap[dialogRoleStatus].title"
      destroy-on-close
    >
      <el-form
        autocomplete="off"
        ref="roleFormRef"
        :model="roleForm"
        status-icon
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="RoleName" prop="role.name">
          <el-input type="text" autocomplete="off" prefix-icon="user" v-model="roleForm.role.name" />
        </el-form-item>
        <el-form-item label="Has All Rule" prop="role.has_all_rule">
          <el-select v-model="roleForm.role.has_all_rule">
            <el-option
              v-for="item in roleHasAllRuleMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === roleForm.role.has_all_rule"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Lock" prop="role.lock">
          <el-select v-model="roleForm.role.lock">
            <el-option
              v-for="item in roleLockMap"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === roleForm.role.lock"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Rule">
          <el-tree
            ref="ruleTreeRef"
            :data="ruleTree"
            show-checkbox
            node-key="id"
            :default-checked-keys="roleForm.ruleList"
            :props="defaultRuleProps"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogRoleVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(roleFormRef)">Reset</el-button>
          <el-button
            type="primary"
            :loading="submitRoleLoading"
            :disabled="submitRoleDisabled"
            @click="dialogRoleStatusMap[dialogRoleStatus].submitAction(roleFormRef)"
          >Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogRuleVisible" title="Rule Manage" destroy-on-close>
      <el-input v-model="filterRuleText" placeholder="Filter keyword" />
      <el-tree
        ref="ruleTreeRef"
        :data="ruleTree"
        node-key="id"
        :props="defaultRuleProps"
        :filter-node-method="filterRuleNode"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <a @click="onAppendRule(data)" v-if="node.id === 0">Append</a>
              <a @click="onRemoveRule(node, data)">Delete</a>
            </span>
          </span>
        </template>
      </el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogRuleVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetTree">Reset</el-button>
          <el-button
            type="primary"
            :loading="submitRuleLoading"
            :disabled="submitRuleDisabled"
            @click="onUpdateRuleList()"
          >Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import { resetForm, allEmpty } from '@/utils/form'
import { roleHasAllRuleMap, roleLockMap } from '@/utils'
import { add as addRole, list as listRole, detail as getRoleDetail, update as updateRole, remove as removeRole } from '@/api/role'
import { add as addRule, list as listRule, updateList as updateRuleList, update as updateRule, remove as removeRule } from '@/api/rule'

const fullscreenLoading = ref(false)
const roleListLoading = ref(false)

const roleList = ref([])
const ruleList = ref([])

const searched = ref(false)
const searchLoading = ref(false)
const searchDisabled = ref(false)

const searchFormRef = ref(null)

const searchForm = reactive({
  role: {
    id: null,
    name: null,
    has_all_rule: null,
    lock: null,
  }
})

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
  getRoleList(callback, callback)
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
  getRoleList(callback, callback)
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
const ruleTreeRef = ref(null)
const ruleTree = ref([])
const defaultRuleProps = {
  children: 'children',
  label: 'label',
}

// [
//   { id: 1, description: 'Member:Add', permission: 'member:add' },
//   { id: 2, description: 'Member:delete', permission: 'member:delete' },
// ]
// =>
// [
//   {
//     id: 0,
//     label: 'member',
//     children: [
//       { id: 1, label: 'add' },
//       { id: 2, label: 'delete' },
//     ],
//   }
// ]
const ruleList2Tree = (_ruleList) => {
  let ruleList = []
  Object.assign(ruleList, _ruleList)
  let ruleTree = []
  let ruleLength = ruleList.length
  while (0 < ruleLength) {
    ruleLength--
    let firstRule = ruleList.shift()
    let ruleNode = {
      id: 0,
      label: firstRule.description.split(':')[0],
      children: [{
        id: firstRule.id,
        label: firstRule.description.split(':')[1],
        value: firstRule.permission,
      }],
    }
    // add children
    let i = 0
    while (i < ruleLength) {
      // add to ruleTree while delete from ruleList
      if (ruleList[i].description.split(':')[0] === ruleNode.label) {
        ruleLength--
        i = -1
        const rule = ruleList.shift()
        ruleNode.children.push({
          id: rule.id,
          label: rule.description.split(':')[1],
          value: firstRule.permission,
        })
      }
      i++
    }
    ruleTree.push(ruleNode)
  }
  return ruleTree
}

const getRuleList = () => {
  listRule().then(response => {
    ruleList.value = response.data
    ruleTree.value = ruleList2Tree(response.data)
  }).catch((error) => {
    ElMessage.error(`get ruleList error: ${JSON.stringify(error)}`)
  })
}

watch(filterRuleText, (value) => {
  console.debug('watch', value)
  if (ruleTreeRef.value) {
    ruleTreeRef.value.filter(value)
  }
})

const filterRuleNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const resetTree = () => {
  getRuleList()
}

const onAppendRule = (data) => {
  // const newChild = { id: id++, label: 'testtest', children: [] }
  // if (!data.children) {
  //   data.children = []
  // }
  // data.children.push(newChild)
  // dataSource.value = [...dataSource.value]
}

const onRemoveRule = (node, data) => {
  // const parent = node.parent
  // const children = parent.data.children || parent.data
  // const index = children.findIndex((d) => d.id === data.id)
  // children.splice(index, 1)
  // dataSource.value = [...dataSource.value]
}

const onUpdateRuleList = () => {
  submitRuleLoading.value = true
  submitRuleDisabled.value = true
  updateRuleList(roleForm).then(() => {
    getRuleList()
    dialogRoleVisible.value = false
    ElMessage.success('update rule success')
  }).catch((error) => {
    ElMessage.error(`update rule error: ${JSON.stringify(error)}`)
  }).finally(() => {
    submitRuleLoading.value = false
    submitRuleDisabled.value = false
  })
}

const getRoleList = (successCallback = null, errorCallback = null) => {
  roleListLoading.value = true
  searchLoading.value = true
  searchDisabled.value = true
  searchForm.currentPage = page.currentPage
  searchForm.pageSize = page.pageSize
  listRole(searchForm).then(response => {
    roleList.value = response.data.list
    page.totalData = response.data.total
    page.currentPage = response.data.currentPage
    page.pageSize = response.data.pageSize
    page.totalPage = response.data.totalPage
    successCallback && successCallback()
  }).catch((error) => {
    errorCallback && errorCallback()
    ElMessage.error(`get roleList error: ${JSON.stringify(error)}`)
  }).finally(() => {
    roleListLoading.value = false
    searchLoading.value = false
    searchDisabled.value = false
  })
}

onMounted(() => {
  getRuleList()
  getRoleList()
})

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

const roleFormRef = ref(null)
const defaultRoleForm = () => {
  return {
    role: {
      id: null,
      name: null,
      has_all_rule: null,
      lock: null,
    },
    ruleList: []
  }
}
const roleForm = reactive(defaultRoleForm())

// ------- add role -------
const showAddRoleDialog = () => {
  Object.assign(roleForm, defaultRoleForm())
  dialogRoleStatus.value = 'add'
  dialogRoleVisible.value = true
}

const onAddRole = () => {
  submitRoleLoading.value = true
  submitRoleDisabled.value = true
  // no parent id
  roleForm.ruleList = ruleTreeRef.value.getCheckedKeys(false).filter(id => id !== 0)
  addRole(roleForm).then(() => {
    getRoleList()
    dialogRoleVisible.value = false
    ElMessage.success('add role success')
  }).catch((error) => {
    ElMessage.error(`add role error: ${JSON.stringify(error)}`)
  }).finally(() => {
    submitRoleLoading.value = false
    submitRoleDisabled.value = false
  })
}

// ------- update role -------
const showUpdateRoleDialog = (roleId) => {
  fullscreenLoading.value = true
  Object.assign(roleForm, defaultRoleForm())
  getRoleDetail({ roleId: roleId }).then(response => {
    roleForm.role.id = response.data.role.id
    roleForm.role.name = response.data.role.name
    roleForm.role.has_all_rule = response.data.role.has_all_rule
    roleForm.role.lock = response.data.role.lock
    roleForm.ruleList = roleForm.role.has_all_rule === 0 ? response.data.ruleList.map(rule => rule.id) : ruleList.value.map(rule => rule.id)
    dialogRoleStatus.value = 'update'
    dialogRoleVisible.value = true
  }).catch((error) => {
    ElMessage.error(`get role detail error: ${JSON.stringify(error)}`)
  }).finally(() => {
    fullscreenLoading.value = false
  })
}

const onUpdateRole = () => {
  submitRoleLoading.value = true
  submitRoleDisabled.value = true
  // no parent id
  roleForm.ruleList = ruleTreeRef.value.getCheckedKeys(false).filter(key => key !== 0)
  updateRole(roleForm).then(() => {
    getRoleList()
    dialogRoleVisible.value = false
    ElMessage.success('update role success')
  }).catch((error) => {
    ElMessage.error(`update role error: ${JSON.stringify(error)}`)
  }).finally(() => {
    submitRoleLoading.value = false
    submitRoleDisabled.value = false
  })
}

// ------- delete role -------
const onDelete = (roleId) => {
  fullscreenLoading.value = true
  removeRole({ roleId: roleId }).then(() => {
    getRoleList()
    ElMessage.success('delete success')
  }).catch((error) => {
    ElMessage.error(`delete error: ${JSON.stringify(error)}`)
  }).finally(() => {
    fullscreenLoading.value = false
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