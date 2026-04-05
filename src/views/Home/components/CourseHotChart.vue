<template>
  <div class="course-hot-chart">
    <div class="chart-header">
      <div class="chart-title">
        <Icon icon="ep:fire" />
        课程学习热度
      </div>
    </div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize @click="handleChartClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent
])

const router = useRouter()

const courseData = ref([
  { name: 'Java程序设计', count: 128, courseId: 1 },
  { name: '数据结构与算法', count: 96, courseId: 2 },
  { name: '数据库系统原理', count: 85, courseId: 3 },
  { name: '计算机网络', count: 72, courseId: 4 },
  { name: '操作系统', count: 58, courseId: 5 }
])

const chartOption = computed(() => {
  const sortedData = [...courseData.value].sort((a, b) => a.count - b.count)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        return `${params[0].name}<br/>学习人次: ${params[0].value}`
      }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '5%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
    },
    yAxis: {
      type: 'category',
      data: sortedData.map(item => item.name),
      axisLine: { lineStyle: { color: '#909399' } },
      axisLabel: { width: 100, overflow: 'truncate' }
    },
    series: [{
      name: '学习人次',
      type: 'bar',
      data: sortedData.map(item => ({
        value: item.count,
        courseId: item.courseId
      })),
      itemStyle: {
        color: new (echarts as any).graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#95d475' },
          { offset: 1, color: '#67C23A' }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      barWidth: '50%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}人'
      }
    }]
  }
})

const handleChartClick = (params: any) => {
  if (params.data?.courseId) {
    router.push(`/study/course?id=${params.data.courseId}`)
  }
}
</script>

<style scoped lang="scss">
.course-hot-chart {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .chart-header {
    margin-bottom: 16px;

    .chart-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .chart-container {
    height: 260px;

    .echarts {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
