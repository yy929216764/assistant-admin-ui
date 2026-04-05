<template>
  <div class="h-[calc(100vh-120px)] flex flex-col bg-white rounded-lg shadow-sm">
    <!-- 顶部导航 -->
    <div class="h-56px border-b border-gray-200 flex items-center justify-between px-20px">
      <div class="flex items-center gap-12px">
        <el-button link @click="handleBack">
          <Icon icon="ep:arrow-left" class="mr-4px" />
          返回
        </el-button>
        <span class="text-16px font-bold">{{ exerciseDetail?.exerciseName || '练习' }}</span>
        <el-tag v-if="exerciseDetail" size="small" type="info">
          {{ currentIndex + 1 }} / {{ exerciseDetail.questions?.length || 0 }}
        </el-tag>
      </div>
      <div class="flex items-center gap-8px">
        <el-tag v-if="courseName" size="small">{{ courseName }}</el-tag>
        <el-button type="primary" size="small" :disabled="!canSubmit" @click="handleSubmit">
          {{ isLastQuestion ? '完成' : '下一题' }}
        </el-button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div v-if="exerciseDetail" class="flex-1 overflow-y-auto p-32px">
      <div class="max-w-800px mx-auto">
        <!-- 题目 -->
        <div class="mb-24px">
          <div class="flex items-center gap-8px mb-16px">
            <el-tag :type="questionTypeTag">{{ questionTypeText }}</el-tag>
            <span class="text-18px font-medium leading-relaxed">{{ currentQuestion?.questionContent }}</span>
          </div>

          <!-- 选项 -->
          <div class="space-y-12px ml-48px">
            <div
              v-for="(value, key) in currentQuestion?.options"
              :key="key"
              class="flex items-center p-16px rounded-8px border-2 cursor-pointer transition-all"
              :class="getOptionClass(key)"
              @click="handleSelectOption(key)"
            >
              <div
                class="w-32px h-32px rounded-full flex items-center justify-center mr-12px font-bold"
                :class="getOptionKeyClass(key)"
              >
                {{ key }}
              </div>
              <span class="text-16px">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- 答题反馈 -->
        <div v-if="showFeedback" class="mt-24px p-20px rounded-8px" :class="feedbackClass">
          <div class="flex items-center gap-8px mb-12px">
            <Icon :icon="feedbackIcon" class="text-20px" />
            <span class="text-16px font-bold">{{ feedbackTitle }}</span>
          </div>
          <div class="space-y-8px">
            <div><span class="font-medium">正确答案：</span>{{ currentQuestion?.correctAnswer }}</div>
            <div><span class="font-medium">答案解析：</span>{{ currentQuestion?.analysis }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部进度条 -->
    <div v-if="exerciseDetail" class="h-60px border-t border-gray-200 px-24px flex items-center">
      <div class="flex-1">
        <el-progress
          :percentage="progressPercent"
          :stroke-width="8"
          :show-text="true"
        />
      </div>
      <div class="ml-24px text-14px text-gray-500">
        已答 {{ answeredCount }} / {{ totalCount }} 题
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && !exerciseDetail" description="练习加载失败" />

    <!-- 完成对话框 -->
    <el-dialog v-model="showCompleteDialog" title="练习完成" width="400px" center :show-close="false" :close-on-click-modal="false">
      <div class="text-center py-24px">
        <Icon icon="ep:circle-check" class="text-64px text-green-500 mb-16px" />
        <div class="text-24px font-bold mb-8px">练习已完成！</div>
        <div class="text-16px text-gray-500">
          得分：<span class="text-24px font-bold text-primary">{{ result?.score }}</span> / {{ result?.totalScore }}
        </div>
        <div class="mt-12px text-14px text-gray-500">
          正确 {{ result?.correctCount }} / {{ result?.totalCount }} 题
          <span v-if="result?.wrongBookAddedCount > 0" class="text-orange-500 ml-8px">
            (新增 {{ result?.wrongBookAddedCount }} 道错题)
          </span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-center gap-16px">
          <el-button @click="handleBack">返回课程</el-button>
          <el-button type="primary" @click="handleViewResult">查看结果</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@/components/Icon'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ExerciseApi,
  type ExerciseDetailRespVO,
  type ExerciseQuestionRespVO,
  type AnswerSubmitReqVO,
  type ExerciseResultRespVO
} from '@/api/study/exercise'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const exerciseDetail = ref<ExerciseDetailRespVO>()
const currentIndex = ref(0)
const selectedAnswer = ref('')
const showFeedback = ref(false)
const answerResult = ref<{ isCorrect: boolean; correctAnswer?: string; analysis?: string }>()
const showCompleteDialog = ref(false)
const result = ref<ExerciseResultRespVO>()

// 已答题记录
const answeredQuestions = ref<Record<number, { userAnswer: string; isCorrect: boolean }>>({})

// 计算属性
const currentQuestion = computed<ExerciseQuestionRespVO | undefined>(() => {
  return exerciseDetail.value?.questions?.[currentIndex.value]
})

const courseName = computed(() => exerciseDetail.value?.courseName)

const questionTypeText = computed(() => {
  const type = currentQuestion.value?.questionType
  switch (type) {
    case 1: return '单选题'
    case 2: return '判断题'
    case 3: return '简答题'
    default: return '未知题型'
  }
})

const questionTypeTag = computed(() => {
  const type = currentQuestion.value?.questionType
  switch (type) {
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'warning'
    default: return 'info'
  }
})

const isLastQuestion = computed(() => {
  return currentIndex.value === (exerciseDetail.value?.questions?.length || 0) - 1
})

const canSubmit = computed(() => {
  return selectedAnswer.value !== '' && !showFeedback.value
})

const progressPercent = computed(() => {
  const total = exerciseDetail.value?.questions?.length || 0
  if (total === 0) return 0
  return Math.round((answeredCount.value / total) * 100)
})

const answeredCount = computed(() => {
  return Object.keys(answeredQuestions.value).length
})

const totalCount = computed(() => exerciseDetail.value?.questions?.length || 0)

const feedbackClass = computed(() => {
  return answerResult.value?.isCorrect ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
})

const feedbackIcon = computed(() => {
  return answerResult.value?.isCorrect ? 'ep:circle-check' : 'ep:circle-close'
})

const feedbackTitle = computed(() => {
  return answerResult.value?.isCorrect ? '回答正确！' : '回答错误'
})

// 方法
const getOptionClass = (key: string) => {
  if (showFeedback.value) {
    if (key === answerResult.value?.correctAnswer) {
      return 'border-green-500 bg-green-50'
    }
    if (key === selectedAnswer.value && !answerResult.value?.isCorrect) {
      return 'border-red-500 bg-red-50'
    }
    return 'border-gray-200 opacity-50'
  }
  if (selectedAnswer.value === key) {
    return 'border-blue-500 bg-blue-50'
  }
  return 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
}

const getOptionKeyClass = (key: string) => {
  if (showFeedback.value) {
    if (key === answerResult.value?.correctAnswer) {
      return 'bg-green-500 text-white'
    }
    if (key === selectedAnswer.value && !answerResult.value?.isCorrect) {
      return 'bg-red-500 text-white'
    }
    return 'bg-gray-200 text-gray-500'
  }
  if (selectedAnswer.value === key) {
    return 'bg-blue-500 text-white'
  }
  return 'bg-gray-200 text-gray-600'
}

const handleSelectOption = (key: string) => {
  if (showFeedback.value) return
  selectedAnswer.value = key
}

const handleSubmit = async () => {
  if (!currentQuestion.value || !exerciseDetail.value) return

  const question = currentQuestion.value

  // 构造提交数据
  const submitData: AnswerSubmitReqVO = {
    exerciseId: exerciseDetail.value.id,
    questionId: question.id,
    userAnswer: selectedAnswer.value,
    isLastQuestion: isLastQuestion.value,
    answerTimeMs: 0
  }

  try {
    const res = await ExerciseApi.submitAnswer(submitData)
    answerResult.value = res
    showFeedback.value = true

    // 记录已答题
    answeredQuestions.value[question.id] = {
      userAnswer: selectedAnswer.value,
      isCorrect: res.isCorrect
    }

    // 更新题目状态
    question.userAnswer = selectedAnswer.value
    question.isCorrect = res.isCorrect
    question.correctAnswer = res.correctAnswer
    question.analysis = res.analysis

    if (res.isCompleted || isLastQuestion.value) {
      // 最后一题，完成练习
      setTimeout(() => {
        handleComplete()
      }, 1500)
    } else {
      // 自动下一题
      setTimeout(() => {
        handleNext()
      }, 1500)
    }
  } catch (error) {
    ElMessage.error('提交答案失败')
  }
}

const handleNext = () => {
  if (isLastQuestion.value) return
  currentIndex.value++
  selectedAnswer.value = ''
  showFeedback.value = false
  answerResult.value = undefined
}

const handleComplete = async () => {
  if (!exerciseDetail.value) return

  try {
    const res = await ExerciseApi.completeExercise(exerciseDetail.value.id)
    result.value = res
    showCompleteDialog.value = true
  } catch (error) {
    ElMessage.error('完成练习失败')
  }
}

const handleBack = () => {
  router.push('/study/course')
}

const handleViewResult = () => {
  if (!exerciseDetail.value) return
  showCompleteDialog.value = false
  router.push({
    path: '/study/exercise/result',
    query: { id: exerciseDetail.value.id }
  })
}

// 加载练习详情
const loadExerciseDetail = async () => {
  const exerciseId = route.query.id as string
  if (!exerciseId) {
    ElMessage.error('练习ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await ExerciseApi.getExerciseDetail(Number(exerciseId))
    exerciseDetail.value = res
  } catch (error) {
    ElMessage.error('加载练习失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExerciseDetail()
})
</script>

<style scoped>
:deep(.el-progress-bar__outer) {
  border-radius: 4px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
}
</style>
