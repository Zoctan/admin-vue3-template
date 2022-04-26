<template>
  <div class="navbar">
    <div class="logo">
      <img :src="logo" />
    </div>

    <SideBarCollapse />

    <div class="rightbar">
      <el-link icon="link">
        <a href="https://github.com/Zoctan/admin-vue3-template" target="_blank">Github</a>
      </el-link>
      <el-link icon="question-filled">
        <a href="https://github.com/Zoctan/admin-vue3-template/issues" target="_blank">Issues</a>
      </el-link>
      <template v-if="memberData">
        <el-dropdown class>
          <span class="el-dropdown-link">
            <el-avatar class="avatar mr-1" :size="30" :src="memberData.avatar || avatar"></el-avatar>
            {{ memberData.nickname || 'None' }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="avatar">
                <router-link to="/member/profile">Profile</router-link>
              </el-dropdown-item>
              <el-dropdown-item icon="back" @click="toLogout">Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <el-button type="text" @click="toLogin">Login</el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import SideBarCollapse from './SideBarCollapse.vue'
import avatar from 'assets/image/avatar.png'
import logo from 'assets/image/logo.png'

const store = useStore()
const route = useRoute()
const router = useRouter()

const memberData = computed(() => store.getters.member.memberData)

const toLogin = () => router.push(`/login`)

const toLogout = () =>
  store.dispatch('memberLogout')
    .then(() => {
      if (!route.meta.auth && !route.meta.permission) {
        location.reload()
      } else {
        router.push({ path: '/login', query: { redirect: route.fullPath } })
      }
    })
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 40px;
  border-bottom: solid 1px #e6e6e6;
  .logo {
    display: flex;
    justify-content: center;
    width: 200px;
    img {
      width: 130px;
    }
  }
  .rightbar {
    position: absolute;
    right: 2%;
    width: 500px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .el-dropdown-link {
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
