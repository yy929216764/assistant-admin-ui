<template>
  <div class="welcome-header-admin">
    <div class="welcome-content">
      <el-avatar :size="64" :src="avatar" class="avatar">
        <img :src="userStore.getDefaultAvatar" alt="avatar" />
      </el-avatar>
      <div class="welcome-text">
        <div class="welcome-title">
          {{ welcomeText }}，<span class="username">{{ nickname }}</span>
          <el-tag type="success" effect="dark" size="small" class="role-tag">管理员</el-tag>
        </div>
        <div class="welcome-subtitle">
          {{ subtitle }}
        </div>
      </div>
    </div>
    <div class="welcome-extra">
      <div class="date-info">
        <div class="weekday">{{ currentWeekday }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStoreWithOut } from '@/store/modules/user'
import { formatDate } from '@/utils/formatTime'

/** 管理员欢迎栏组件 */
defineOptions({ name: 'WelcomeHeaderAdmin' })

const userStore = useUserStoreWithOut()

// 用户信息
const nickname = computed(() => userStore.getUser?.nickname || '管理员')
const avatar = computed(() => userStore.getUser?.avatar || '')

// 欢迎语
const welcomeText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 副标题
const subtitle = computed(() => {
  return '欢迎使用智能辅助学习系统管理平台'
})

// 当前日期
const currentDate = computed(() => {
  return formatDate(new Date(), 'YYYY年MM月DD日')
})

// 当前星期
const currentWeekday = computed(() => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[new Date().getDay()]
})
</script>

<style scoped lang="scss">
.welcome-header-admin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(17, 153, 142, 0.3);
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.welcome-text {
  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 10px;

    .username {
      color: #ffd700;
    }

    .role-tag {
      font-size: 12px;
    }
  }

  .welcome-subtitle {
    font-size: 14px;
    opacity: 0.9;
  }
}

.welcome-extra {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-info {
  text-align: right;

  .weekday {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 4px;
  }

  .date {
    font-size: 16px;
    font-weight: 500;
  }
}
</style>
