<template>
  <div class="app-main">
    <router-view :key="$route.name" v-slot="{ Component }">
      <transition :name="$route.meta.transition">
        <div :key="$route.name">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
    <el-backtop />
  </div>
</template>

<script setup>

</script>
