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
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else-if="courseList.length === 0"
      description="暂无学习中的课程"
      :image-size="80"
    >
      <el-button type="primary" @click="goToCourses">去选课</el-button>
    </el-empty>

    <div v-else class="course-list">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { UserCourseApi } from '@/api/study/usercourse'
import { CourseApi } from '@/api/study/course'

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
const message = useMessage()

// 加载状态
const loading = ref(false)

// 课程数据（从API获取）
const courseList = ref<any[]>([])

// 获取课程学习进度数据
const fetchCourseProgress = async () => {
  loading.value = true
  try {
    // 1. 获取当前用户的课程学习关系
    const userCourseData = await UserCourseApi.getUserCoursePage({
      pageNo: 1,
      pageSize: 10,
      enrollStatus: 1 // 学习中
    })

    if (!userCourseData.list || userCourseData.list.length === 0) {
      courseList.value = []
      return
    }

    // 2. 获取课程详情以补充课程名称
    const courseListWithNames = await Promise.all(
      userCourseData.list.map(async (item: any) => {
        try {
          const courseDetail = await CourseApi.getCourse(item.courseId)
          return {
            courseId: item.courseId,
            courseName: courseDetail.courseName || `课程${item.courseId}`,
            progress: item.progressPercent || 0,
            completedHours: Math.round((item.progressPercent || 0) / 100 * 20),
            totalHours: 20
          }
        } catch {
          return {
            courseId: item.courseId,
            courseName: `课程${item.courseId}`,
            progress: item.progressPercent || 0,
            completedHours: Math.round((item.progressPercent || 0) / 100 * 20),
            totalHours: 20
          }
        }
      })
    )

    courseList.value = courseListWithNames
  } catch (error) {
    message.error('获取课程进度失败')
    console.error(error)
    courseList.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCourseProgress()
})

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

  .loading-container {
    padding: 20px 0;
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
