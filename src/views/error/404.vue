<template>
  <el-result title="404 Not Found" sub-title="please check your url">
    <template #icon>
      <el-image :src="coffee"></el-image>
    </template>
    <template #extra>
      <el-button @click="onBack" type="info" icon="arrow-left">Back</el-button>
      <template v-if="!memberData">
        <el-button @click="toLogin" type="primary" icon="arrow-right">Go to Login</el-button>
      </template>
    </template>
  </el-result>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import coffee from 'assets/image/coffee.png'

const router = useRouter()
const route = useRoute()

const store = useStore()

const memberData = computed(() => store.getters.member.memberData)

const onBack = () => {
  if (route.query.noGoBack) {
    router.push({ path: '/' })
  } else {
    router.go(-1)
  }
}

const toLogin = () => {
  router.push({ path: '/login' })
}
</script>

<style lang="scss" scoped>
</style>
