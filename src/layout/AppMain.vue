<template>
  <div class="app-main">
    <router-view :key="$route.name" v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <el-backtop />
  </div>
</template>

<script setup>

</script>
