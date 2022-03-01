<template>
  <el-result title="404 Not Found" sub-title="请检查您输入的网址是否正确">
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
