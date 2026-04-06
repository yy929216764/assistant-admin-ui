<template>
  <div class="student-home">
    <!-- 欢迎栏 -->
    <WelcomeHeader />

    <!-- 第一行统计：核心学习数据 -->
    <div class="section-title">
      <Icon icon="ep:data-analysis" /> 学习数据概览
    </div>
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="累计提问"
          :value="overviewData.totalQuestions"
          icon="ep:chat-dot-round"
          color="#409EFF"
          :trend="5"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="答题次数"
          :value="overviewData.totalAnswers"
          icon="ep:edit-pen"
          color="#67C23A"
          :trend="12"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="正确率"
          :value="overviewData.correctRate + '%'"
          icon="ep:trophy"
          color="#E6A23C"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="当前错题"
          :value="overviewData.wrongBookCount"
          icon="ep:warning"
          color="#F56C6C"
        />
      </el-col>
    </el-row>

    <!-- 第二行统计：练习数据 -->
    <el-row :gutter="20" class="stat-row" style="margin-top: 20px;">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="累计练习"
          :value="overviewData.totalExercises"
          icon="ep:document-checked"
          color="#909399"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="平均得分"
          :value="overviewData.averageScore"
          icon="ep:data-line"
          color="#67C23A"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="已掌握错题"
          :value="overviewData.masteredCount"
          icon="ep:circle-check"
          color="#409EFF"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <StatCard
          title="累计错题"
          :value="overviewData.totalWrongQuestions"
          icon="ep:collection"
          color="#E6A23C"
        />
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14">
        <LearningTrendChart />
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
        <WrongBookAnalysis />
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
import { getStudyOverview, type StudyOverviewVO } from '@/api/study/overview'
import WelcomeHeader from './components/WelcomeHeader.vue'
import StatCard from './components/StatCard.vue'
import QuickActions from './components/QuickActions.vue'
import RecentActivities from './components/RecentActivities.vue'
import LearningTrendChart from './components/LearningTrendChart.vue'
import WrongBookAnalysis from './components/WrongBookAnalysis.vue'

/** 学生端首页 */
defineOptions({ name: 'StudentHome' })

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
    message.error('获取学习数据失败')
  } finally {
    loading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  fetchOverviewData()
})
</script>

<style scoped lang="scss">
.student-home {
  padding: 20px;
  min-height: 100%;
  background: #f5f7fa;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    font-size: 20px;
    color: #409EFF;
  }
}

.stat-row {
  margin-top: 8px;
}
</style>
