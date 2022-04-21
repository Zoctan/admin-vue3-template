<template>
  <div class="app-container">
    <div class="filter-container" v-permission="'log:list'">
      <el-form :inline="true" ref="searchFormRef" :model="searchForm">
        <el-form-item>
          <el-button type="success" icon="refresh" circle @click="getLogList"></el-button>
        </el-form-item>
        <el-form-item label="Content" prop="log.content">
          <el-input v-model="searchForm.log.content" />
        </el-form-item>
        <el-form-item label="Level" prop="log.level">
          <el-select v-model="searchForm.log.level" clearable>
            <el-option v-for="item in logLevelMap" :key="item.value" :label="item.label" :value="item.value"
              :disabled="item.value === searchForm.log.level" />
          </el-select>
        </el-form-item>
        <el-form-item label="CreatedAt" prop="log.created_at">
          <el-date-picker v-model="searchForm.log.created_at" type="date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" />
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

    <el-table v-loading="logListLoading" :data="logList" border highlight-current-row style="width: 100%">
      <el-table-column type="index" :index="getIndex" />
      <el-table-column label="Level" prop="level" width="100">
        <template #default="scope">
          <el-tag size="small" v-if="logLevelMap.length > 0" :type="logLevelMap[scope.row.level].color">
            {{ logLevelMap[scope.row.level].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="MemberUsername" prop="member_username" width="160" />
      <el-table-column label="Content" prop="content" width="250">
        <template #default="scope">
          <div class="content">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Ip" prop="ip" width="150">
        <template #default="scope">
          {{ long2ip(scope.row.ip) }}
        </template>
      </el-table-column>
      <el-table-column label="IpCity" prop="ip_city" width="150" />
      <el-table-column label="CreatedAt" prop="created_at" width="180" />
      <el-table-column fixed="right" label="Operations" v-permission="'log:remove'">
        <template #default="scope">
          <el-space wrap>
            <el-button @click="showLogDialog(scope.row.id)">Show</el-button>
            <span v-permission="'log:remove'">
              <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" icon-color="red"
                :title="`Are you sure to remove this log?`" @confirm="onRemove(scope.row.id)">
                <template #reference>
                  <el-button>Remove</el-button>
                </template>
              </el-popconfirm>
            </span>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, sizes, prev, pager, next, jumper" v-model:currentPage="page.currentPage"
      v-model:page-size="page.pageSize" :page-sizes="page.pageSizes" :total="page.totalData"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"></el-pagination>

    <el-dialog v-model="dialogLogVisible" title="Log" destroy-on-close>
      <el-descriptions title="" direction="vertical" :column="4" border>
        <el-descriptions-item label="Level">
          <el-tag size="small" :type="logLevelMap[currentLog.level].color">
            {{ logLevelMap[currentLog.level].label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="MemberUsername">{{ currentLog.member_username }}</el-descriptions-item>
        <el-descriptions-item label="Ip">{{ long2ip(currentLog.ip) }}</el-descriptions-item>
        <el-descriptions-item label="IpCity">{{ currentLog.ip_city }}</el-descriptions-item>
        <el-descriptions-item label="Content" :span="4">{{ currentLog.content }}</el-descriptions-item>
        <el-descriptions-item label="Extra" :span="4">{{ currentLog.extra }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogLogVisible = false">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { resetForm, allEmpty } from 'utils/form'
import { long2ip } from 'utils/ip'
import Pair from 'utils/Pair'
import { list as listLog, remove as removeLog } from 'api/log'

const logLevelMap = ref([])

onMounted(async () => {
  logLevelMap.value = (await Pair.getValueByKey('logLevelMap')).value
  await getLogList()
})

const logListLoading = ref(false)
const logList = ref([])

const searched = ref(false)
const onSearchLoading = ref(false)
const onSearchDisabled = ref(false)
const restSearchLoading = ref(false)
const restSearchDisabled = ref(false)
const searchFormRef = ref(null)
const searchForm = reactive({
  log: {
    level: null,
    content: null,
    created_at: null,
  },
  currentPage: null,
  pageSize: null,
})

const onSearch = () => {
  searched.value = true
  getLogList()
}

const restSearch = async (formEl) => {
  searched.value = false
  restSearchLoading.value = true
  restSearchDisabled.value = true
  resetForm(formEl)
  try {
    await getLogList()
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
  getLogList()
}

const handleCurrentChange = (currentPage) => {
  page.currentPage = currentPage
  getLogList()
}

const getIndex = (index) => {
  return (page.currentPage - 1) * page.pageSize + index + 1
}

const getLogList = () => {
  return new Promise((resolve, reject) => {
    logListLoading.value = true
    onSearchLoading.value = true
    onSearchDisabled.value = true
    searchForm.currentPage = page.currentPage
    searchForm.pageSize = page.pageSize
    listLog(searchForm)
      .then((response) => {
        logList.value = response.data.list
        page.totalData = response.data.total
        page.currentPage = response.data.currentPage
        page.pageSize = response.data.pageSize
        page.totalPage = response.data.totalPage
        resolve(response)
      })
      .catch((error) => {
        ElMessage.error('Get log list error')
        console.error('Get log list error', error)
        reject(error)
      })
      .finally(() => {
        logListLoading.value = false
        onSearchLoading.value = false
        onSearchDisabled.value = false
      })
  })
}

const dialogLogVisible = ref(false)
const currentLog = ref({})
const showLogDialog = (logId) => {
  for (let i = 0; i < logList.value.length; i++) {
    if (logList.value[i].id === logId) {
      currentLog.value = logList.value[i]
      dialogLogVisible.value = true
      return
    }
  }
}

// ------- remove log -------
const onRemove = (logId) => {
  removeLog({ id: logId })
    .then(async () => {
      await getLogList()
      ElMessage.success('Remove log success')
    })
    .catch((error) => {
      ElMessage.error('Remove log error')
      console.error('Remove log error', error)
    })
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 20px;
}

.content {
  width: 230px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>