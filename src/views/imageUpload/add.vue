<template>
  <div class="app-container">
    <div class="option">
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
            <el-form-item label="Path" prop="watermarkConfig.path">
              <el-input v-model="optionForm.watermarkConfig.path" clearable />
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
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <div class="upload-box">
      <el-upload ref="imageUploadRef" drag :action="getUploadUrl()" :limit="1" :file-list="imageUploadList"
        :on-change="handleImageChange" :on-exceed="handleImageExceed" :before-upload="beforeImageUpload"
        :on-success="handleImageSuccess" :on-progress="handleImageProgress" :on-error="handleImageError"
        :on-remove="handleImageRemove" :auto-upload="false">
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">
          Drop image file here or
          <em>Click to choose</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">Image file with a size less than 100MB</div>
        </template>
      </el-upload>
      <el-button type="success" :loading="onAddImageLoading" :disabled="onAddImageDisabled" @click="onAddImage">
        Upload to server
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { uploadUrl, remove as removeUploadFile } from '@/api/upload'
import { useStore } from 'vuex'
import { genFileId } from 'element-plus'

const store = useStore()
const accessToken = computed(() => store.getters.token.accessToken)

const imageUploadRef = ref(null)
const imageUploadList = ref([])
const onAddImageLoading = ref(false)
const onAddImageDisabled = ref(true)
const optionFormRef = ref(null)
const optionForm = reactive({
  useTimeDir: false,
  useRandomName: false,
  overwrite: false,
  reizeConfig: {
    enable: false,
    width: null,
    height: null
  },
  compressConfig: {
    enable: false,
    quality: 75
  },
  watermarkConfig: {
    enable: false,
    path: '',
    x: 0,
    y: 0,
    position: 'top-left',
  }
})
const watermarkPositionList = ref(['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'])

const getUploadUrl = () => {

  return uploadUrl({ type: 'image', overwrite: true, Authorization: accessToken })
}

const handleImageExceed = (files) => {
  if (imageUploadRef.value) {
    imageUploadRef.value.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    imageUploadRef.value.handleStart(file)
  }
}

const beforeImageUpload = (file) => {
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

const handleImageSuccess = (response, uploadFile, uploadFiles) => {
  onAddImageDisabled.value = true
  if (response.errno !== 0) {
    imageUploadRef.value.clearFiles()
    console.error('upload image error', response.msg)
    return ElMessage.error('upload image error')
  }
  return ElMessage.success('upload image success')
}

const handleImageError = (error, uploadFile, uploadFiles) => {
}

const handleImageProgress = (event, uploadFile, uploadFiles) => {
}

const handleImageChange = (uploadFile, uploadFiles) => {
  if (imageUploadList.value.length > 0) {
    onAddImageDisabled.value = false
  }
}

const onAddImage = () => {
  imageUploadRef.value.submit()
}

const handleImageRemove = (file) => {
  if (!file) {
    return ElMessage.error('no image')
  }
  removeUploadFile({ type: 'image', filename: file.name })
    .then(() => {
      ElMessage.success('remove image success')
    })
    .catch((error) => {
      ElMessage.error('remove image error')
      console.error('remove image error', error)
    })
}
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  align-items: center;


  .option {
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 1;

    .config-collapse {
      width: 280px;
    }
  }

  .upload-box {
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 3;
  }
}
</style>