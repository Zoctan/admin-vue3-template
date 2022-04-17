<template>
  <div class="introduction">
    <h1>Code By Zoctan</h1>
    <el-image :src="background"></el-image>
  </div>
</template>

<script setup>
import background from 'assets/image/library.jpg'
</script>

<style lang="scss" scoped>
.introduction {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .el-image {
    height: 70vh;
  }
}
</style>