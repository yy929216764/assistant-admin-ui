<template>
  <div class="admin-home">
    <!-- 欢迎栏 -->
    <WelcomeHeaderAdmin />

    <!-- 管理员看板内容（后续开发） -->
    <el-card class="admin-content">
      <template #header>
        <div class="card-header">
          <span>机构管理看板</span>
          <el-tag type="warning">开发中</el-tag>
        </div>
      </template>
      <div class="placeholder-content">
        <el-empty description="管理看板功能开发中，敬请期待">
          <template #image>
            <Icon icon="ep:data-board" style="font-size: 60px; color: #909399;" />
          </template>
        </el-empty>
        <div class="quick-links">
          <el-button type="primary" @click="goToStudy">
            <Icon icon="ep:reading" />
            进入学习中心
          </el-button>
          <el-button @click="goToSystem">
            <Icon icon="ep:setting" />
            系统管理
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import WelcomeHeaderAdmin from './components/WelcomeHeaderAdmin.vue'

/** 管理员首页 */
defineOptions({ name: 'AdminHome' })

const router = useRouter()

const goToStudy = () => {
  router.push('/study/course')
}

const goToSystem = () => {
  router.push('/system/user')
}
</script>

<style scoped lang="scss">
.admin-home {
  padding: 20px;
  min-height: 100%;
  background: #f5f7fa;
}

.admin-content {
  margin-top: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.placeholder-content {
  padding: 40px;

  .quick-links {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
  }
}
</style>
