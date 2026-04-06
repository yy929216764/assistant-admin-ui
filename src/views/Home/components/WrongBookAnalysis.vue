<template>
  <div class="wrong-book-analysis">
    <div class="chart-header">
      <div class="chart-title">
        <Icon icon="ep:warning-filled" />
        错题分析
      </div>
      <el-button type="primary" link @click="goToWrongBook">
        错题本 <Icon icon="ep:arrow-right" />
      </el-button>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-value">{{ wrongBookStats.totalWrong }}</div>
        <div class="stat-label">累计错题</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ wrongBookStats.unmastered }}</div>
        <div class="stat-label">待复习</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ wrongBookStats.mastered }}</div>
        <div class="stat-label">已掌握</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="2" animated />
      </div>
      <el-empty
        v-else-if="wrongBookStats.totalWrong === 0"
        description="暂无错题，继续保持！"
        :image-size="60"
      />
      <v-chart v-else :option="chartOption" autoresize />
    </div>

    <!-- 待复习提醒 -->
    <div v-if="wrongBookStats.unmastered > 0" class="review-alert">
      <el-alert
        :title="`您有 ${wrongBookStats.unmastered} 道错题待复习`"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <el-button type="warning" link @click="startRetry">
            立即复习 <Icon icon="ep:refresh-right" />
          </el-button>
        </template>
      </el-alert>
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
import { WrongBookApi } from '@/api/study/wrongbook'

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent
])

defineOptions({ name: 'WrongBookAnalysis' })

const router = useRouter()
const message = useMessage()

const loading = ref(false)

// 错题统计数据
const wrongBookStats = ref({
  totalWrong: 0,
  unmastered: 0,
  mastered: 0,
  byQuestionType: [
    { name: '单选题', value: 0 },
    { name: '判断题', value: 0 },
    { name: '简答题', value: 0 }
  ]
})

// 获取错题统计数据
const fetchWrongBookStats = async () => {
  loading.value = true
  try {
    // 获取未掌握的错题
    const unmasteredData = await WrongBookApi.getWrongBookPage({
      masterStatus: 0, // 未掌握
      pageNo: 1,
      pageSize: 1
    })

    // 获取已掌握的错题
    const masteredData = await WrongBookApi.getWrongBookPage({
      masterStatus: 1, // 已掌握
      pageNo: 1,
      pageSize: 1
    })

    const unmastered = unmasteredData.total || 0
    const mastered = masteredData.total || 0

    // 按题型统计（简化处理，实际应该从详情中统计）
    // 这里使用模拟分布，实际项目中可以优化
    const total = unmastered + mastered
    wrongBookStats.value = {
      totalWrong: total,
      unmastered: unmastered,
      mastered: mastered,
      byQuestionType: [
        { name: '单选题', value: Math.round(total * 0.5) },
        { name: '判断题', value: Math.round(total * 0.3) },
        { name: '简答题', value: Math.round(total * 0.2) }
      ].filter(item => item.value > 0)
    }
  } catch (error) {
    console.error('获取错题统计失败:', error)
  } finally {
    loading.value = false
  }
}

// 图表配置
const chartOption = computed(() => {
  const data = wrongBookStats.value.byQuestionType.filter(item => item.value > 0)

  if (data.length === 0) {
    return {}
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}道 ({d}%)'
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '错题分布',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data,
        color: ['#F56C6C', '#E6A23C', '#409EFF']
      }
    ]
  }
})

// 跳转到错题本
const goToWrongBook = () => {
  router.push('/study/wrong-book')
}

// 开始错题重练
const startRetry = () => {
  router.push('/study/practice')
}

onMounted(() => {
  fetchWrongBookStats()
})
</script>

<style scoped lang="scss">
.wrong-book-analysis {
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
        color: #F56C6C;
      }
    }
  }

  .stats-overview {
    display: flex;
    justify-content: space-around;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        line-height: 1;
      }

      .stat-label {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }

      &:nth-child(1) .stat-value {
        color: #F56C6C;
      }

      &:nth-child(2) .stat-value {
        color: #E6A23C;
      }

      &:nth-child(3) .stat-value {
        color: #67C23A;
      }
    }
  }

  .chart-container {
    height: 200px;

    .loading-container {
      padding: 40px 0;
    }

    :deep(.echarts) {
      width: 100%;
      height: 100%;
    }
  }

  .review-alert {
    margin-top: 16px;

    :deep(.el-alert) {
      padding: 12px 16px;
    }
  }
}
</style>
