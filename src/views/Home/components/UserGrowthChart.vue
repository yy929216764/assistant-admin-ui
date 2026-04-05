<template>
  <div class="user-growth-chart">
    <div class="chart-header">
      <div class="chart-title">
        <Icon icon="ep:trend-charts" />
        学员增长趋势
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
import { BarChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, ToolboxComponent, DataZoomComponent, GraphicComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, ToolboxComponent, DataZoomComponent, GraphicComponent
])

const timeRange = ref('7')

const mockData = {
  '7': {
    dates: ['04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07'],
    counts: [5, 8, 12, 6, 15, 10, 18]
  },
  '30': {
    dates: ['03-09', '03-13', '03-17', '03-21', '03-25', '03-29', '04-02', '04-06'],
    counts: [8, 12, 15, 22, 18, 25, 30, 35]
  }
}

const chartOption = computed(() => {
  const data = mockData[timeRange.value as keyof typeof mockData]

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: { lineStyle: { color: '#909399' } }
    },
    yAxis: {
      type: 'value',
      name: '新增学员',
      axisLine: { show: true, lineStyle: { color: '#67C23A' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
    },
    series: [{
      name: '新增学员',
      type: 'bar',
      data: data.counts,
      itemStyle: {
        color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#95d475' },
          { offset: 0.5, color: '#67C23A' },
          { offset: 1, color: '#4e9a2d' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '50%'
    }]
  }
})

const handleRangeChange = (val: string) => {
  timeRange.value = val
}
</script>

<style scoped lang="scss">
.user-growth-chart {
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
