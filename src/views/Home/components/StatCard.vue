<template>
  <div class="stat-card" :style="{ borderColor: color }">
    <div class="stat-icon" :style="{ backgroundColor: color + '20', color: color }">
      <Icon :icon="icon" />
    </div>
    <div class="stat-content">
      <div class="stat-value" :style="{ color: color }">{{ value }}</div>
      <div class="stat-title">{{ title }}</div>
    </div>
    <!-- 趋势指示器 -->
    <div v-if="trend !== undefined" class="stat-trend" :class="{ 'trend-up': trend > 0, 'trend-down': trend < 0 }">
      <Icon :icon="trend > 0 ? 'ep:arrow-up' : 'ep:arrow-down'" />
      <span>{{ Math.abs(trend) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon: string
  color: string
  trend?: number // 趋势百分比，正数表示上升，负数表示下降
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: skewX(-20deg) translateX(-150%);
    transition: transform 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);

    &::before {
      transform: skewX(-20deg) translateX(200%);
    }
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    font-size: 28px;
    margin-right: 16px;
    transition: all 0.3s;
  }

  &:hover .stat-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 4px;
      transition: all 0.3s;
    }

    .stat-title {
      font-size: 14px;
      color: #909399;
    }
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background: #f5f7fa;
    color: #606266;

    &.trend-up {
      background: #f6ffed;
      color: #52c41a;
    }

    &.trend-down {
      background: #fff2f0;
      color: #ff4d4f;
    }
  }
}
</style>
