<template>
  <template v-for="router in routers" :key="router.name">
    <template v-if="!router.meta.hidden">
      <!-- 一级菜单 -->
      <template v-if="!router.meta.dropDown">
        <!-- 当前路由路径如果是该菜单路径，不重复进入 -->
        <el-menu-item :index="joinPath(router)" :disabled="$route.path === joinPath(router)">
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
        <el-sub-menu :index="router.path">
          <template #title>
            <el-icon v-if="router.meta.icon">
              <component :is="router.meta.icon"></component>
            </el-icon>
            <span>{{ router.name }}</span>
          </template>
          <!-- 多重子菜单 -->
          <template v-for="child in router.children" :key="child.name">
            <SideBarItem :routers="[child]" :isChild="true" :parentPath="router.path" />
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
  isChild: {
    type: Boolean,
    required: false,
    default: false,
  },
  parentPath: {
    type: String,
    required: false,
    default: '',
  },
})

const joinPath = (router) => {
  // console.debug('router', router)
  // console.debug('isChild', props.isChild)
  // console.debug('parentPath', props.parentPath)
  if (router.children && router.children.length > 0) {
    return router.children[0].path == '' ? router.path : `${router.path}/${router.children[0].path}`
  } else if (props.isChild && props.parentPath) {
    return `${props.parentPath}/${router.path}`
  } else {
    return router.path
  }
}
</script>

<style lang="scss" scoped>
</style>
