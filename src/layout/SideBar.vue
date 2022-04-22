<template>
  <!-- whether vue-router mode is activated. If true, index will be used as 'path' to activate the route action -->
  <el-menu :default-active="$route.path" :collapse="!sidebarOpened" mode="vertical" router>
    <SideBarItem :routers="accessedRouters" />
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import SideBarItem from './SideBarItem.vue'

const store = useStore()
const sidebarOpened = computed(() => store.getters.sidebarOpened)
const accessedRouters = computed(() => store.getters.accessedRouters)
</script>

<style lang="scss" scoped>
.el-menu:not(.el-menu--collapse) {
  width: 200px;
  height: 96vh;
}
</style>
