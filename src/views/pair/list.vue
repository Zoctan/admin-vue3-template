<template>
  <div class="app-container">
    <div class="filter-container" v-permission="'pair:list'">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getPairList"></el-button>
          <el-button type="primary" icon="plus" circle v-permission="'pair:add'" @click="showAddPairDialog"></el-button>
        </el-form-item>
        <el-form-item label="Description" prop="pair.description">
          <el-input v-model="searchForm.pair.description" />
        </el-form-item>
        <el-form-item label="Key" prop="pair.key">
          <el-input v-model="searchForm.pair.key" />
        </el-form-item>
        <el-form-item label="Value" prop="pair.value">
          <el-input v-model="searchForm.pair.value" />
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

    <el-table v-loading="pairListLoading" :data="pairList" border highlight-current-row style="width: 100%">
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Description" prop="description" width="250" />
      <el-table-column label="Key" prop="key" width="200" />
      <el-table-column label="UpdatedAt / CreatedAt" width="200">
        <template #default="scope">
          <div>{{ scope.row.updated_at || "None" }}</div>
          <div>{{ scope.row.created_at }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations">
        <template #default="scope">
          <el-space wrap>
            <span>
              <el-button @click="showUpdatePairDialog(scope.row.id)">Update</el-button>
            </span>
            <template v-permission:or="['pair:update', 'pair:remove']">
              <span v-permission="'pair:update'">
                <el-button @click="showUpdatePairDialog(scope.row.id)">Update</el-button>
              </span>
              <span v-permission="'pair:remove'">
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                  :title="`Are you sure to remove this pair?`" @confirm="onRemove(scope.row.id)">
                  <template #reference>
                    <el-button>Remove</el-button>
                  </template>
                </el-popconfirm>
              </span>
            </template>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, sizes, prev, pager, next, jumper" v-model:currentPage="page.currentPage"
      v-model:page-size="page.pageSize" :page-sizes="page.pageSizes" :total="page.totalData"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"></el-pagination>

    <el-dialog v-model="dialogPairVisible" :title="dialogPairStatusMap[dialogPairStatus].title" destroy-on-close>
      <el-form ref="pairFormRef" :model="pairForm" status-icon label-position="left" label-width="110px">
        <el-form-item label="Description" prop="pair.description" required>
          <el-input type="text" autocomplete="off" v-model="pairForm.pair.description" />
        </el-form-item>
        <el-form-item label="Key" prop="pair.key" required>
          <el-input type="text" autocomplete="off" v-model="pairForm.pair.key" />
        </el-form-item>
        <el-form-item label="Value" prop="pair.value" required>
          <el-input v-model="pairForm.pair.value" autosize type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogPairVisible = false">Cancel</el-button>
          <el-button type="danger" @click="resetForm(pairFormRef)">Reset</el-button>
          <el-button type="primary" :loading="submitPairLoading" :disabled="submitPairDisabled"
            @click="dialogPairStatusMap[dialogPairStatus].submitAction(pairFormRef)">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { resetForm, allEmpty } from 'utils/form'
import { list as listPair, add as addPair, update as updatePair, remove as removePair, } from 'api/pair'

onMounted(async () => {
  await getPairList()
})

const pairListLoading = ref(false)
const pairList = ref([])

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)
const restSearchLoading = ref(false)
const restSearchDisabled = ref(false)
const searchFormRef = ref(null)
const searchForm = reactive({
  pair: {
    description: null,
    key: null,
    value: null,
  },
  currentPage: null,
  pageSize: null,
})

const onSearch = () => {
  searched.value = true
  getPairList()
}

const restSearch = async (formEl) => {
  searched.value = false
  restSearchLoading.value = true
  restSearchDisabled.value = true
  resetForm(formEl)
  try {
    await getPairList()
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
  getPairList()
}

const handleCurrentChange = (currentPage) => {
  page.currentPage = currentPage
  getPairList()
}

const getIndex = (index) => {
  return (page.currentPage - 1) * page.pageSize + index + 1
}

const getPairList = () => {
  return new Promise((resolve, reject) => {
    pairListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    searchForm.currentPage = page.currentPage
    searchForm.pageSize = page.pageSize
    listPair(searchForm)
      .then((response) => {
        pairList.value = response.data.list
        page.totalData = response.data.total
        page.currentPage = response.data.currentPage
        page.pageSize = response.data.pageSize
        page.totalPage = response.data.totalPage
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get pair list error')
        console.error('Get pair list error', error)
        reject(error)
      })
      .finally(() => {
        pairListLoading.value = false
        onSearchLoading.value = false
        onSearchDisabled.value = false
      })
  })
}

const dialogPairStatusMap = {
  add: {
    title: 'Add Pair',
    submitAction: (formEl) => onAddPair(formEl),
  },
  update: {
    title: 'Update Pair',
    submitAction: (formEl) => onUpdatePair(formEl),
  },
}
const dialogPairStatus = ref('add')
const dialogPairVisible = ref(false)
const submitPairLoading = ref(false)
const submitPairDisabled = ref(false)
const defaultPairForm = () => {
  return {
    pair: {
      id: null,
      description: null,
      key: null,
      value: null,
    },
  }
}
const pairFormRef = ref(null)
const pairForm = reactive(defaultPairForm())

const checkPairValue = (value) => {
  try {
    JSON.parse(value)
    return true
  } catch (error) {
    return false
  }
}

// ------- add pair -------
const showAddPairDialog = () => {
  Object.assign(pairForm, defaultPairForm())
  dialogPairStatus.value = 'add'
  dialogPairVisible.value = true
}

const onAddPair = () => {
  if (!checkPairValue(pairForm.pair.value)) {
    return ElMessage.error('Value is not a valid json string')
  }
  submitPairLoading.value = true
  submitPairDisabled.value = true
  addPair(pairForm)
    .then(async () => {
      await getPairList()
      ElMessage.success('Add pair success')
      dialogPairVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Add pair error')
      console.error('Add pair error', error)
    })
    .finally(() => {
      submitPairLoading.value = false
      submitPairDisabled.value = false
    })
}

// ------- update pair -------
const showUpdatePairDialog = (pairId) => {
  Object.assign(pairForm, defaultPairForm())
  for (let i = 0; i < pairList.value.length; i++) {
    if (pairList.value[i].id === pairId) {
      pairForm.pair = pairList.value[i]
      pairForm.pair.value = JSON.stringify(pairForm.pair.value)
      dialogPairStatus.value = 'update'
      dialogPairVisible.value = true
      return
    }
  }
}

const onUpdatePair = () => {
  if (!checkPairValue(pairForm.pair.value)) {
    return ElMessage.error('Value is not a valid json string')
  }
  submitPairLoading.value = true
  submitPairDisabled.value = true
  updatePair(pairForm)
    .then(async () => {
      await getPairList()
      ElMessage.success('Update pair success')
      dialogPairVisible.value = false
    })
    .catch((error) => {
      ElMessage.error('Update pair error')
      console.error('Update pair error', error)
    })
    .finally(() => {
      submitPairLoading.value = false
      submitPairDisabled.value = false
    })
}

// ------- remove pair -------
const onRemove = (pairId) => {
  removePair({ id: pairId })
    .then(async () => {
      await getPairList()
      ElMessage.success('Remove pair success')
    })
    .catch((error) => {
      ElMessage.error('Remove pair error')
      console.error('Remove pair error', error)
    })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px
}

.content {
  width: 230px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>