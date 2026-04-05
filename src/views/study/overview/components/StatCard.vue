<template>
  <div class="stat-card" :style="{ borderColor: color }">
    <div class="stat-icon" :style="{ backgroundColor: color + '20', color: color }">
      <Icon :icon="icon" />
    </div>
    <div class="stat-content">
      <div class="stat-value" :style="{ color: color }">{{ value }}</div>
      <div class="stat-title">{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon: string
  color: string
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
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
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 4px;
    }

    .stat-title {
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
