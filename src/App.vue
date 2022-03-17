<template>
  <router-view></router-view>
</template>

<script setup>
import { watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// 防止登录后，刷新导致计时失效
store.dispatch('startTokenClock')

watch(
  () => store.getters.token.rest,
  (rest, prevRest) => {
    // refresh token
    if (store.getters.token.rest <= 20) {
      store.dispatch('refresh').then(() => store.dispatch('startTokenClock'))
    }
  }
)
</script>

<style lang="scss">
@import "@/assets/style/app.scss";
</style>
