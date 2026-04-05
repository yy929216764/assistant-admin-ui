<template>
  <div class="learning-trend-chart">
    <div class="chart-header">
      <div class="chart-title">
        <Icon icon="ep:trend-charts" />
        学习趋势
      </div>
      <el-radio-group v-model="timeRange" size="small" @change="handleRangeChange">
        <el-radio-button label="7">最近7天</el-radio-button>
        <el-radio-button label="30">最近30天</el-radio-button>
      </el-radio-group>
    </div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, ToolboxComponent, DataZoomComponent, GraphicComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart, BarChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, ToolboxComponent, DataZoomComponent, GraphicComponent
])

/** 学习趋势图表组件 */
defineOptions({ name: 'LearningTrendChart' })

// 时间范围
const timeRange = ref('7')

// 模拟数据
const mockData = {
  '7': {
    dates: ['04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07'],
    questionCounts: [5, 8, 3, 10, 6, 12, 8],
    correctRates: [80, 85, 60, 90, 75, 88, 82]
  },
  '30': {
    dates: ['03-09', '03-13', '03-17', '03-21', '03-25', '03-29', '04-02', '04-06'],
    questionCounts: [12, 15, 8, 20, 18, 25, 22, 30],
    correctRates: [75, 80, 65, 85, 78, 82, 88, 85]
  }
}

// 图表配置
const chartOption = computed(() => {
  const data = mockData[timeRange.value as keyof typeof mockData]

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['答题数量', '正确率'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: {
        lineStyle: { color: '#909399' }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '答题数',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: { color: '#409EFF' }
        },
        axisLabel: {
          formatter: '{value} 道'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#E4E7ED'
          }
        }
      },
      {
        type: 'value',
        name: '正确率',
        position: 'right',
        min: 0,
        max: 100,
        axisLine: {
          show: true,
          lineStyle: { color: '#67C23A' }
        },
        axisLabel: {
          formatter: '{value} %'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '答题数量',
        type: 'bar',
        data: data.questionCounts,
        itemStyle: {
          color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#409EFF' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      },
      {
        name: '正确率',
        type: 'line',
        yAxisIndex: 1,
        data: data.correctRates,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#67C23A',
          width: 3
        },
        itemStyle: {
          color: '#67C23A',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      }
    ]
  }
})

// 处理时间范围变化
const handleRangeChange = (val: string) => {
  timeRange.value = val
}
</script>

<style scoped lang="scss">
.learning-trend-chart {
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
    height: 300px;

    .echarts {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
