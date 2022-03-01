<template>
  <el-result title="401 No Auth" sub-title="您无权访问该网址">
    <template #icon>
      <el-image :src="coffee"></el-image>
    </template>
    <template #extra>
      <el-button @click="onBack" type="primary" icon="arrow-left">返回</el-button>
    </template>
  </el-result>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import coffee from '@/assets/image/coffee.png'

const router = useRouter()
const route = useRoute()

const onBack = () => {
  if (route.query.noGoBack) {
    router.push({ path: '/' })
  } else {
    router.go(-1)
  }
}
</script>

<style lang="scss" scoped>
</style>
