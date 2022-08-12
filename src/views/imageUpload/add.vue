<template>
  <div class="app-container">
    <div class="option-container">
      <el-form ref="optionFormRef" :model="optionForm" status-icon label-position="left" label-width="140px">
        <el-form-item label="UseTimeDir" prop="useTimeDir">
          <el-radio-group v-model="optionForm.useTimeDir">
            <el-radio-button :label="true" />
            <el-radio-button :label="false" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="UseRandomName" prop="useRandomName">
          <el-radio-group v-model="optionForm.useRandomName">
            <el-radio-button :label="true" />
            <el-radio-button :label="false" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Overwrite" prop="overwrite">
          <el-radio-group v-model="optionForm.overwrite">
            <el-radio-button :label="true" />
            <el-radio-button :label="false" />
          </el-radio-group>
        </el-form-item>
        <el-collapse class="config-collapse">
          <el-collapse-item title="ReizeConfig">
            <el-form-item label="Enable" prop="reizeConfig.enable">
              <el-radio-group v-model="optionForm.reizeConfig.enable">
                <el-radio-button :label="true" />
                <el-radio-button :label="false" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Width" prop="reizeConfig.width">
              <el-input v-model="optionForm.reizeConfig.width" clearable />
            </el-form-item>
            <el-form-item label="Height" prop="reizeConfig.height">
              <el-input v-model="optionForm.reizeConfig.height" clearable />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
        <el-collapse class="config-collapse">
          <el-collapse-item title="CompressConfig">
            <el-form-item label="Enable" prop="compressConfig.enable">
              <el-radio-group v-model="optionForm.compressConfig.enable">
                <el-radio-button :label="true" />
                <el-radio-button :label="false" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Quality" prop="compressConfig.quality">
              <el-input v-model="optionForm.compressConfig.quality" clearable />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
        <el-collapse class="config-collapse">
          <el-collapse-item title="WatermarkConfig">
            <el-form-item label="Enable" prop="watermarkConfig.enable">
              <el-radio-group v-model="optionForm.watermarkConfig.enable">
                <el-radio-button :label="true" />
                <el-radio-button :label="false" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="X" prop="watermarkConfig.x">
              <el-input v-model="optionForm.watermarkConfig.x" clearable />
            </el-form-item>
            <el-form-item label="Y" prop="watermarkConfig.y">
              <el-input v-model="optionForm.watermarkConfig.y" clearable />
            </el-form-item>
            <el-form-item label="Position" prop="watermarkConfig.position">
              <el-select v-model="optionForm.watermarkConfig.position">
                <el-option v-for="item in watermarkPositionList" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <div class="block" v-if="optionForm.watermarkConfig.path">
              <span class="demonstration">Watermark</span>
              <el-image :src="optionForm.watermarkConfig.path" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <div class="upload-container">
      <el-upload ref="uploadRef" drag :action="uploadUrl()" :http-request="uploadMehod" :limit="1"
        :file-list="uploadList" :on-change="handleUploadChange" :on-success="handleUploadSuccess"
        :on-error="handleUploadError" :on-exceed="handleUploadExceed" :before-upload="beforeUpload"
        :on-progress="handleUploadProgress" :on-remove="handleUploadRemove" :auto-upload="false">
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">
          Drop file here or
          <em>Click to choose</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">File with a size less than 100MB</div>
        </template>
      </el-upload>
      <el-button type="success" :loading="onAddLoading" :disabled="onAddDisabled" @click="uploadRef.submit()">
        Upload to server
      </el-button>
      <el-progress style="width: 200px;margin-top: 8px" :text-inside="true" :stroke-width="20"
        :percentage="progressPercent" />

      <div class="down-container">
        <template v-for="item in uploadedList" :key="item.name">
          <div class="block">
            <span class="demonstration">{{ item.name }}</span>
            <el-image :src="item.url" :alt="item.name" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { genFileId } from 'element-plus'
import { uploadUrl, add as uploadFile, remove as removeUploadFile } from 'api/upload'
import { object2FormData } from 'utils/url'

const uploadRef = ref(null)
const uploadList = ref([])
const uploadedList = ref([])
const progressPercent = ref(0)
const onAddLoading = ref(false)
const onAddDisabled = ref(true)
const optionFormRef = ref(null)
const optionForm = reactive({
  type: 'image',
  useTimeDir: false,
  useRandomName: false,
  overwrite: false,
  reizeConfig: {
    enable: false,
    width: 0,
    height: 0
  },
  compressConfig: {
    enable: false,
    quality: 75,
    newFile: true
  },
  watermarkConfig: {
    enable: false,
    path: 'http://127.0.0.1/php-seed/upload/?filename=logo.png&type=image',
    x: 0,
    y: 0,
    position: 'bottom-right',
  }
})
const watermarkPositionList = ref(['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'])

const uploadMehod = async (params) => {
  progressPercent.value = 0
  console.debug('uploadMehod params', params)

  const file = params.file
  const form = new FormData()
  form.append('file', file)
  object2FormData(optionForm, form)

  progressPercent.value = 50

  return uploadFile(form, progressEvent => {
    progressPercent.value = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
  })
}

const handleUploadExceed = (files) => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    uploadRef.value.handleStart(file)
  }
}

const beforeUpload = (file) => {
  if (file.type.indexOf('image/') < 0) {
    ElMessage.error('File must be image format!')
    return false
  }
  if (file.size / 1024 / 1024 > 100) {
    ElMessage.error('File size can not exceed 100MB!')
    return false
  }
  if (file.size < 1) {
    ElMessage.error('File size can not lessen 1KB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  console.debug('handleUploadSuccess', response)
  progressPercent.value = 100
  onAddDisabled.value = true
  uploadList.value = []
  uploadRef.value.clearFiles()
  uploadedList.value = uploadedList.value.concat(response.data)
  ElMessage.success('Upload success')
}

const handleUploadError = (error, uploadFile, uploadFiles) => {
  progressPercent.value = 0
  uploadRef.value.clearFiles()
  ElMessage.error('Upload error')
  console.error('Upload error', error)
}

const handleUploadProgress = (event, uploadFile, uploadFiles) => {
}

const handleUploadChange = (uploadFile, uploadFiles) => {
  if (uploadList.value.length > 0) {
    onAddDisabled.value = false
  }
}

const handleUploadRemove = (file) => {
  if (!file) {
    return ElMessage.error('no file')
  }
  removeUploadFile({ type: 'image', filename: file.name })
    .then(() => {
      ElMessage.success('Remove success')
    })
    .catch((error) => {
      ElMessage.error('Remove error')
      console.error('Remove error', error)
    })
}
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  align-items: center;

  .option-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 1;

    .config-collapse {
      width: 280px;
    }
  }

  .upload-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 2;

    .down-container {
      margin-top: 10px;
      display: flex;
      align-items: center;
      flex-direction: row;
    }
  }

  .block {
    padding: 0 10px;
    text-align: center;
    display: inline-block;
    box-sizing: border-box;
    vertical-align: top;

    .demonstration {
      display: block;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }

    .el-image {
      width: 200px;
    }
  }
}
</style>