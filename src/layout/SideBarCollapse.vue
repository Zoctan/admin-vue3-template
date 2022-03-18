<template>
  <el-button
    type="primary"
    @click="toggleSideBar"
    :icon="!sidebarOpened ? 'expand' : 'fold'"
    circle
  ></el-button>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const sidebarOpened = computed(() => store.getters.sidebarOpened)
const toggleSideBar = () => store.dispatch('toggleSideBar')
</script>

<style lang="scss" scoped>
</style>
