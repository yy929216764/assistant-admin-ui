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
import { ref, computed, onMounted } from 'vue'
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
import { getAdminDashboard } from '@/api/study/overview/admin'

use([
  CanvasRenderer,
  BarChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent
])

const router = useRouter()
const loading = ref(false)

// 课程热度数据（从API获取）
const courseData = ref<{ name: string; count: number; courseId: number }[]>([])

// 获取课程热度数据
const fetchCourseHotData = async () => {
  loading.value = true
  try {
    const data = await getAdminDashboard()
    if (data.courseHot && data.courseHot.length > 0) {
      courseData.value = data.courseHot.map(item => ({
        name: item.courseName,
        count: item.studyCount,
        courseId: item.courseId
      }))
    } else {
      // 如果没有数据，显示空状态
      courseData.value = []
    }
  } catch (error) {
    console.error('获取课程热度数据失败:', error)
    courseData.value = []
  } finally {
    loading.value = false
  }
}

const chartOption = computed(() => {
  const hasData = courseData.value.length > 0
  const sortedData = hasData
    ? [...courseData.value].sort((a, b) => a.count - b.count).slice(0, 5) // 取前5
    : [{ name: '暂无数据', count: 0, courseId: 0 }]

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!hasData) return '暂无数据'
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
        show: hasData,
        position: 'right',
        formatter: '{c}人'
      }
    }]
  }
})

const handleChartClick = (params: any) => {
  if (params.data?.courseId && params.data.courseId > 0) {
    router.push(`/study/course?id=${params.data.courseId}`)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCourseHotData()
})
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
