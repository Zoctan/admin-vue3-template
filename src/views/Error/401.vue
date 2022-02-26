<template>
  <div class="error401">
    <el-button @click="onBack" type="primary" icon="arrow-left">返回</el-button>
    <h1>你没有权限访问页面</h1>
    <img :src="error401Gif" width="313" height="428" alt="Girl has dropped her ice cream." />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import error401Gif from '@/assets/image/401.gif'

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
