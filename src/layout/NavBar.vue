<template>
  <div class="navbar">
    <div class="logo">
      <img :src="logo" />
    </div>

    <SideBarCollapse />

    <div class="rightbar">
      <el-link icon="link">
        <a href="https://github.com/Zoctan/php-seed" target="_blank">Github</a>
      </el-link>
      <el-dropdown class>
        <span class="el-dropdown-link">
          <el-image class="avatar" :src="member.avatar || avatar"></el-image>
          {{ member.name || '测试' }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="avatar">
              <router-link to="/member/detail">账户中心</router-link>
            </el-dropdown-item>
            <el-dropdown-item icon="back">
              <span @click="logout">注销</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SideBarCollapse from './SideBarCollapse.vue'
import avatar from '@/assets/image/avatar.png'
import logo from '@/assets/image/logo.png'

const store = useStore()
const router = useRouter()

const member = computed(() => store.getters.member)

const logout = () => store.dispatch('memberLogout').then(() => router.push({ path: '/login' }))
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
    justify-content: space-around;
    align-items: center;
  }
  .el-dropdown-link {
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    .avatar {
      width: 30px;
      height: 30px;
      margin-right: 5px;
    }
  }
}
</style>
