<template>
  <div class="role-based-home">
    <!-- 加载状态 -->
    <div v-if="!isSetUser" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <!-- 学生端首页 -->
    <StudentHome v-else-if="isStudent" />
    <!-- 管理员端首页（暂时使用现有首页） -->
    <AdminHome v-else />
    <!-- 调试信息（开发完成后删除） -->
    <div v-if="isDev" class="debug-info">
      <el-tag type="info">角色: {{ rolesInfo }}</el-tag>
      <el-tag :type="isStudent ? 'success' : 'warning'">是否学生: {{ isStudent }}</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStoreWithOut } from '@/store/modules/user'
import StudentHome from './StudentHome.vue'
import AdminHome from './AdminHome.vue'

/** 角色判断入口组件 */
defineOptions({ name: 'RoleBasedHome' })

const userStore = useUserStoreWithOut()

// 是否开发模式
const isDev = import.meta.env.DEV

// 是否已完成用户信息设置
const isSetUser = computed(() => userStore.getIsSetUser)

// 获取角色信息（用于调试）
const rolesInfo = computed(() => {
  const roles = userStore.getRoles
  return Array.isArray(roles) ? roles.join(', ') : JSON.stringify(roles)
})

// 判断是否为学生角色
const isStudent = computed(() => {
  const roles = userStore.getRoles
  console.log('[RoleBasedHome] 用户角色:', roles)
  console.log('[RoleBasedHome] 是否数组:', Array.isArray(roles))
  console.log('[RoleBasedHome] 包含student:', roles?.includes('student'))
  return Array.isArray(roles) && roles.includes('student')
})
</script>

<style scoped lang="scss">
.role-based-home {
  min-height: 100%;
}

.loading-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin: 20px;
}

.debug-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 9999;
}
</style>
