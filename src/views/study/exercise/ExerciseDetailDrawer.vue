<template>
  <el-drawer
    v-model="visible"
    title="练习详情"
    size="600px"
    :destroy-on-close="true"
  >
    <div v-if="detail" class="detail-container">
      <!-- 练习基本信息 -->
      <div class="info-section">
        <div class="section-title">
          <Icon icon="ep:info-filled" class="mr-8px" />
          基本信息
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">练习名称：</span>
            <span class="value">{{ detail.exerciseName }}</span>
          </div>
          <div class="info-item">
            <span class="label">所属课程：</span>
            <span class="value">{{ detail.courseName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">练习类型：</span>
            <dict-tag :type="DICT_TYPE.EXERCISE_TYPE" :value="detail.exerciseType" />
          </div>
          <div class="info-item">
            <span class="label">练习状态：</span>
            <dict-tag :type="DICT_TYPE.EXERCISE_STATUS" :value="detail.status" />
          </div>
          <div class="info-item">
            <span class="label">题目数量：</span>
            <span class="value">{{ detail.questionCount }} 题</span>
          </div>
          <div class="info-item">
            <span class="label">开始时间：</span>
            <span class="value">{{ formatDateTime(detail.startTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 练习成绩 -->
      <div v-if="detail.status === 2" class="score-section">
        <div class="section-title">
          <Icon icon="ep:trophy" class="mr-8px" />
          练习成绩
        </div>
        <div class="score-cards">
          <div class="score-card">
            <div class="score-number" :class="getScoreClass(detail.score)">
              {{ detail.score }}
            </div>
            <div class="score-label">得分</div>
          </div>
          <div class="score-card">
            <div class="score-number text-primary">
              {{ detail.correctCount }}/{{ detail.questionCount }}
            </div>
            <div class="score-label">正确率</div>
          </div>
          <div class="score-card">
            <div class="score-number text-warning">
              {{ formatDuration(detail.startTime, detail.submitTime) }}
            </div>
            <div class="score-label">用时</div>
          </div>
        </div>
      </div>

      <!-- 答题明细 -->
      <div v-if="detail.questions && detail.questions.length > 0" class="questions-section">
        <div class="section-title">
          <Icon icon="ep:list" class="mr-8px" />
          答题明细
        </div>
        <div class="question-list">
          <div
            v-for="(question, index) in detail.questions"
            :key="question.id"
            class="question-item"
            :class="{ 'is-correct': question.isCorrect, 'is-wrong': question.isCorrect === false }"
          >
            <div class="question-header">
              <span class="question-index">第 {{ index + 1 }} 题</span>
              <dict-tag :type="DICT_TYPE.QUESTION_TYPE" :value="question.questionType" size="small" />
              <el-tag
                v-if="question.isCorrect !== undefined"
                :type="question.isCorrect ? 'success' : 'danger'"
                size="small"
                effect="dark"
              >
                {{ question.isCorrect ? '✓ 正确' : '✗ 错误' }}
              </el-tag>
              <el-tag v-else type="info" size="small">未作答</el-tag>
            </div>
            <div class="question-content">{{ question.questionContent }}</div>
            <div class="question-answer">
              <div class="answer-row">
                <span class="answer-label">你的答案：</span>
                <span :class="question.isCorrect ? 'text-success' : 'text-danger'">
                  {{ question.userAnswer || '未作答' }}
                </span>
              </div>
              <div class="answer-row">
                <span class="answer-label">正确答案：</span>
                <span class="text-success">{{ question.correctAnswer }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button v-if="detail.status === 0" type="primary" @click="handleStart">
          <Icon icon="ep:video-play" class="mr-4px" />
          开始练习
        </el-button>
        <el-button v-else-if="detail.status === 1" type="warning" @click="handleContinue">
          <Icon icon="ep:refresh-right" class="mr-4px" />
          继续练习
        </el-button>
        <el-button v-else type="success" @click="handleRetry">
          <Icon icon="ep:refresh" class="mr-4px" />
          重新练习
        </el-button>
        <el-button @click="handleViewWrong">
          <Icon icon="ep:close-bold" class="mr-4px" />
          查看错题
        </el-button>
      </div>
    </div>

    <el-empty v-else description="加载中..." />
  </el-drawer>
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { DICT_TYPE } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'
import { ExerciseApi, type ExerciseDetailRespVO } from '@/api/study/exercise'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()
const visible = ref(false)
const detail = ref<ExerciseDetailRespVO>()
const exerciseId = ref<number>()

// 打开抽屉
const open = async (id: number) => {
  exerciseId.value = id
  visible.value = true
  try {
    detail.value = await ExerciseApi.getExerciseDetail(id)
  } catch (error) {
    console.error('加载练习详情失败:', error)
  }
}

defineExpose({ open })

// 格式化日期时间
const formatDateTime = (date: string | undefined) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 计算时长
const formatDuration = (start: string | undefined, end: string | undefined) => {
  if (!start || !end) return '-'
  const diff = dayjs(end).diff(dayjs(start), 'minute')
  if (diff < 1) return '1分钟内'
  if (diff < 60) return `${diff}分钟`
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `${hours}小时${mins}分钟`
}

// 获取分数样式
const getScoreClass = (score: number | undefined) => {
  if (!score) return ''
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  return 'text-danger'
}

// 开始练习
const handleStart = () => {
  visible.value = false
  router.push({
    path: '/study/exercise/do',
    query: { id: exerciseId.value }
  })
}

// 继续练习
const handleContinue = () => {
  visible.value = false
  router.push({
    path: '/study/exercise/do',
    query: { id: exerciseId.value }
  })
}

// 重新练习
const handleRetry = () => {
  visible.value = false
  // TODO: 调用重新生成练习接口
}

// 查看错题
const handleViewWrong = () => {
  visible.value = false
  router.push({
    path: '/study/wrong-book',
    query: { exerciseId: exerciseId.value }
  })
}
</script>

<style scoped>
.detail-container {
  padding: 0 16px 16px;
}

.info-section,
.score-section,
.questions-section,
.action-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-item .label {
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  white-space: nowrap;
}

.info-item .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.score-cards {
  display: flex;
  gap: 16px;
}

.score-card {
  flex: 1;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.score-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.score-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

.question-item.is-correct {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.question-item.is-wrong {
  border-color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.question-index {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.question-content {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.question-answer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.answer-row {
  display: flex;
  gap: 8px;
}

.answer-label {
  color: var(--el-text-color-secondary);
}

.text-success {
  color: var(--el-color-success);
  font-weight: 500;
}

.text-danger {
  color: var(--el-color-danger);
  font-weight: 500;
}

.text-primary {
  color: var(--el-color-primary);
}

.text-warning {
  color: var(--el-color-warning);
}

.action-section {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
