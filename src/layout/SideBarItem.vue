<template>
  <template v-for="router in routers" :key="router.name">
    <template v-if="!router.meta.hidden">
      <!-- 一级菜单 -->
      <template v-if="!router.meta.dropDown">
        <!-- 如果当前路由路径是该菜单路径，禁止重复点击 -->
        <el-menu-item :index="resolvePath(router)" :disabled="$route.path === resolvePath(router)">
          <el-icon v-if="router.meta.icon">
            <component :is="router.meta.icon"></component>
          </el-icon>
          <template #title>
            <span>{{ router.name }}</span>
          </template>
        </el-menu-item>
      </template>
      <!-- 二级以上菜单 -->
      <template v-else>
        <el-sub-menu :index="resolvePath(router)">
          <template #title>
            <el-icon v-if="router.meta.icon">
              <component :is="router.meta.icon"></component>
            </el-icon>
            <span>{{ router.name }}</span>
          </template>
          <!-- 多重子菜单 -->
          <template v-for="child in router.children" :key="child.name">
            <SideBarItem :routers="[child]" :basePath="getBasePath(router.path)" />
          </template>
        </el-sub-menu>
      </template>
    </template>
  </template>
</template>

<script setup>
const props = defineProps({
  routers: {
    type: Array,
    required: true,
  },
  basePath: {
    type: String,
    required: false,
    default: ''
  }
})

const getBasePath = (routePath) => {
  if (props.basePath) {
    return `${props.basePath}/${routePath}`
  }
  return routePath
}

const resolvePath = (router) => {
  // console.debug('router.name', router.name)
  // console.debug('basePath', props.basePath)
  let routePath = router.path
  if (router.children && router.children.length === 1) {
    // only one child
    routePath = router.children[0].path == '' ? router.path : `${router.path}/${router.children[0].path}`
  }
  if (props.basePath) {
    routePath = `${props.basePath}/${routePath}`
  }
  // no child
  return routePath
}
</script>

<style lang="scss" scoped>
</style>
