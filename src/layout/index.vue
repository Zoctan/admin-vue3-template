<template>
  <el-container>
    <el-header height="40px">
      <NavBar />
    </el-header>
    <el-container>
      <el-aside style="--el-aside-width: {{ !sidebarOpened ? '200px' : '64px' }}">
        <SideBar />
      </el-aside>
      <el-main>
        <AppMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import NavBar from './NavBar.vue'
import SideBar from './SideBar.vue'
import AppMain from './AppMain.vue'

const store = useStore()
const sidebarOpened = computed(() => store.getters.sidebarOpened)
</script>

<style lang="scss" scoped>
.el-header {
  --el-header-padding: 0;
}
</style>
