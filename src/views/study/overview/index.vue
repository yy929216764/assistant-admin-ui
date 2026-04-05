<template>
  <div class="study-overview">
    <ContentWrap title="学习概览">
      <template #extra>
        <el-button type="primary" @click="refreshData">
          <Icon icon="ep:refresh" /> 刷新数据
        </el-button>
      </template>
    </ContentWrap>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <StatCard
          title="累计提问"
          :value="overviewData.totalQuestions"
          icon="ep:chat-dot-round"
          color="#409EFF"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="答题次数"
          :value="overviewData.totalAnswers"
          icon="ep:edit-pen"
          color="#67C23A"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="正确率"
          :value="overviewData.correctRate + '%'"
          icon="ep:trophy"
          color="#E6A23C"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="当前错题"
          :value="overviewData.wrongBookCount"
          icon="ep:warning"
          color="#F56C6C"
        />
      </el-col>
    </el-row>

    <!-- 第二行统计 -->
    <el-row :gutter="20" class="stat-row" style="margin-top: 20px;">
      <el-col :span="6">
        <StatCard
          title="累计练习"
          :value="overviewData.totalExercises"
          icon="ep:document-checked"
          color="#909399"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="平均得分"
          :value="overviewData.averageScore"
          icon="ep:data-line"
          color="#67C23A"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="已掌握错题"
          :value="overviewData.masteredCount"
          icon="ep:circle-check"
          color="#409EFF"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="累计错题"
          :value="overviewData.totalWrongQuestions"
          icon="ep:collection"
          color="#E6A23C"
        />
      </el-col>
    </el-row>

    <!-- 快速入口 -->
    <QuickActions style="margin-top: 24px;" />

    <!-- 最近学习记录 -->
    <RecentActivities
      :activities="overviewData.recentActivities"
      style="margin-top: 24px;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { getStudyOverview, type StudyOverviewVO } from '@/api/study/overview'
import StatCard from './components/StatCard.vue'
import QuickActions from './components/QuickActions.vue'
import RecentActivities from './components/RecentActivities.vue'

/** 学习概览页面 */
defineOptions({ name: 'StudyOverview' })

const message = useMessage()

// 概览数据
const overviewData = ref<StudyOverviewVO>({
  totalQuestions: 0,
  totalAnswers: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  correctRate: 0,
  totalExercises: 0,
  averageScore: 0,
  wrongBookCount: 0,
  masteredCount: 0,
  totalWrongQuestions: 0,
  recentActivities: []
})

const loading = ref(false)

/** 获取概览数据 */
const fetchOverviewData = async () => {
  loading.value = true
  try {
    const data = await getStudyOverview()
    overviewData.value = data
  } catch (error) {
    message.error('获取学习概览数据失败')
  } finally {
    loading.value = false
  }
}

/** 刷新数据 */
const refreshData = () => {
  fetchOverviewData()
  message.success('数据已刷新')
}

/** 初始化 */
onMounted(() => {
  fetchOverviewData()
})
</script>

<style scoped lang="scss">
.study-overview {
  padding: 20px;

  .stat-row {
    margin-top: 20px;
  }
}
</style>
