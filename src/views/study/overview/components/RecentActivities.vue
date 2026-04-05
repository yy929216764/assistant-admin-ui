<template>
  <div class="recent-activities">
    <div class="section-title">最近学习记录</div>
    <el-empty v-if="!activities || activities.length === 0" description="暂无学习记录" />
    <div v-else class="activity-list">
      <div
        v-for="activity in activities"
        :key="activity.time"
        class="activity-item"
        @click="handleClick(activity)"
      >
        <div class="activity-icon" :class="activity.type">
          <Icon :icon="getIcon(activity.type)" />
        </div>
        <div class="activity-content">
          <div class="activity-title">{{ activity.title }}</div>
          <div class="activity-desc">{{ activity.description }}</div>
        </div>
        <div class="activity-time">{{ formatPast(activity.time) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatPast } from '@/utils/formatTime'
import type { RecentActivityVO } from '@/api/study/overview'

interface Props {
  activities: RecentActivityVO[]
}

const props = defineProps<Props>()
const router = useRouter()

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    question: 'ep:chat-dot-round',
    exercise: 'ep:edit-pen',
    wrongbook: 'ep:warning'
  }
  return icons[type] || 'ep:info-filled'
}

const handleClick = (activity: RecentActivityVO) => {
  switch (activity.type) {
    case 'exercise':
      router.push(`/study/exercise/do?id=${activity.relatedId}`)
      break
    case 'wrongbook':
      router.push(`/study/wrong-book/detail?id=${activity.relatedId}`)
      break
    case 'question':
      router.push('/study/ai-tutor')
      break
  }
}
</script>

<style scoped lang="scss">
.recent-activities {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .section-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 4px solid #409EFF;
  }

  .activity-list {
    .activity-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      &:not(:last-child) {
        border-bottom: 1px solid #ebeef5;
      }

      .activity-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 16px;
        font-size: 20px;

        &.question {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.exercise {
          background: #f6ffed;
          color: #52c41a;
        }

        &.wrongbook {
          background: #fff2f0;
          color: #ff4d4f;
        }
      }

      .activity-content {
        flex: 1;

        .activity-title {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .activity-desc {
          font-size: 13px;
          color: #909399;
        }
      }

      .activity-time {
        font-size: 13px;
        color: #c0c4cc;
      }
    }
  }
}
</style>
