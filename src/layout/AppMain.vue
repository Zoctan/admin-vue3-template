<template>
  <div class="app-main">
    <router-view :key="$route.name" v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <el-backtop />
  </div>
</template>

<script setup>

</script>
