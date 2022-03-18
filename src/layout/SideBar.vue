<template>
  <!-- 启用 vue-router 模式：在激活导航时以 index 作为 path 进行路由跳转 -->
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
  height: 100vh;
}
</style>
