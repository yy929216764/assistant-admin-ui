<template>
  <div class="course-progress-chart">
    <div class="chart-header">
      <div class="chart-title">
        <Icon icon="ep:reading" />
        课程学习进度
      </div>
      <el-button type="primary" link @click="goToCourses">
        全部课程 <Icon icon="ep:arrow-right" />
      </el-button>
    </div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize @click="handleChartClick" />
    </div>
    <div class="course-list">
      <div
        v-for="course in courseList"
        :key="course.courseId"
        class="course-item"
        @click="goToCourse(course.courseId)"
      >
        <div class="course-info">
          <span class="course-name">{{ course.courseName }}</span>
          <span class="course-progress">{{ course.progress }}%</span>
        </div>
        <el-progress
          :percentage="course.progress"
          :color="getProgressColor(course.progress)"
          :show-text="false"
          :stroke-width="8"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent
])

// 为了兼容编译，添加global属性
declare global {
  interface Window {
    echarts: any
  }
}

/** 课程进度图表组件 */
defineOptions({ name: 'CourseProgressChart' })

const router = useRouter()

// 模拟课程数据
const courseList = ref([
  { courseId: 1, courseName: 'Java程序设计', progress: 75, completedHours: 15, totalHours: 20 },
  { courseId: 2, courseName: '数据结构与算法', progress: 45, completedHours: 9, totalHours: 20 },
  { courseId: 3, courseName: '数据库系统原理', progress: 100, completedHours: 20, totalHours: 20 },
  { courseId: 4, courseName: '计算机网络', progress: 30, completedHours: 6, totalHours: 20 },
  { courseId: 5, courseName: '操作系统', progress: 10, completedHours: 2, totalHours: 20 }
])

// 计算图表数据
const chartData = computed(() => {
  return courseList.value.map(course => ({
    name: course.courseName,
    value: course.progress,
    courseId: course.courseId
  }))
})

// 图表配置
const chartOption = computed(() => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>学习进度: ${params.value}%`
      }
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '课程进度',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.value,
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      }
    ]
  }
})

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67C23A'
  if (progress >= 50) return '#409EFF'
  if (progress >= 30) return '#E6A23C'
  return '#F56C6C'
}

// 跳转到课程详情
const goToCourse = (courseId: number) => {
  router.push(`/study/course?id=${courseId}`)
}

// 跳转到全部课程
const goToCourses = () => {
  router.push('/study/course')
}

// 图表点击事件
const handleChartClick = (params: any) => {
  if (params.data && params.data.courseId) {
    goToCourse(params.data.courseId)
  }
}
</script>

<style scoped lang="scss">
.course-progress-chart {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .chart-title {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;

      .icon {
        color: #409EFF;
      }
    }
  }

  .chart-container {
    height: 250px;

    .echarts {
      width: 100%;
      height: 100%;
    }
  }

  .course-list {
    margin-top: 16px;
    max-height: 200px;
    overflow-y: auto;

    .course-item {
      padding: 10px 0;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f5f7fa;
        padding-left: 8px;
        border-radius: 4px;
      }

      .course-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;

        .course-name {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }

        .course-progress {
          font-size: 13px;
          color: #409EFF;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
