<template>
  <el-button
    type="primary"
    @click="toggleSideBar"
    :icon="sidebar.opened ? 'expand' : 'fold'"
    circle
  ></el-button>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const sidebar = computed(() => store.getters.sidebar)

const toggleSideBar = () => store.dispatch('toggleSideBar')
</script>

<style lang="scss" scoped>
</style>
