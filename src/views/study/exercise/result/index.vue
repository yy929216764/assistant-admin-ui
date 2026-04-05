<template>
  <div class="h-[calc(100vh-120px)] overflow-y-auto bg-white rounded-lg shadow-sm p-24px">
    <div class="max-w-900px mx-auto">
      <!-- 头部 -->
      <div class="text-center mb-32px">
        <div class="flex items-center justify-center gap-12px mb-16px">
          <el-button link @click="handleBack">
            <Icon icon="ep:arrow-left" class="mr-4px" />
            返回
          </el-button>
          <span class="text-24px font-bold">练习结果</span>
        </div>

        <!-- 得分卡片 -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-16px p-32px mb-24px">
          <div class="text-16px text-gray-600 mb-8px">本次练习得分</div>
          <div class="text-56px font-bold text-primary mb-8px">
            {{ result?.score || 0 }}
          </div>
          <div class="text-16px text-gray-500">
            总分 {{ result?.totalScore || 0 }} 分
          </div>
          <div class="mt-16px flex items-center justify-center gap-24px">
            <div class="flex items-center gap-8px">
              <Icon icon="ep:circle-check" class="text-green-500 text-20px" />
              <span class="text-16px">正确 {{ result?.correctCount || 0 }} 题</span>
            </div>
            <div class="flex items-center gap-8px">
              <Icon icon="ep:circle-close" class="text-red-500 text-20px" />
              <span class="text-16px">错误 {{ wrongCount }} 题</span>
            </div>
            <div class="flex items-center gap-8px">
              <Icon icon="ep:pie-chart" class="text-blue-500 text-20px" />
              <span class="text-16px">正确率 {{ result?.accuracy || 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-center gap-16px">
          <el-button @click="handleBack">
            <Icon icon="ep:back" class="mr-4px" />
            返回课程
          </el-button>
          <el-button type="primary" @click="handleViewWrongBook" v-if="wrongCount > 0">
            <Icon icon="ep:notebook" class="mr-4px" />
            查看错题
          </el-button>
          <el-button type="success" @click="handleRetry">
            <Icon icon="ep:refresh" class="mr-4px" />
            再练一次
          </el-button>
        </div>
      </div>

      <!-- 题目解析 -->
      <div class="space-y-16px">
        <div class="text-18px font-bold flex items-center gap-8px mb-16px">
          <Icon icon="ep:document" />
          题目解析
        </div>

        <div
          v-for="(item, index) in result?.answerResults"
          :key="item.questionId"
          class="border rounded-12px overflow-hidden"
          :class="item.isCorrect ? 'border-green-200' : 'border-red-200'"
        >
          <!-- 题目头部 -->
          <div
            class="px-20px py-16px flex items-center justify-between cursor-pointer"
            :class="item.isCorrect ? 'bg-green-50' : 'bg-red-50'"
            @click="toggleExpand(item.questionId)"
          >
            <div class="flex items-center gap-12px">
              <div
                class="w-28px h-28px rounded-full flex items-center justify-center text-14px font-bold"
                :class="item.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
              >
                <Icon :icon="item.isCorrect ? 'ep:check' : 'ep:close'" />
              </div>
              <span class="font-medium">第 {{ index + 1 }} 题</span>
              <el-tag :type="item.isCorrect ? 'success' : 'danger'" size="small">
                {{ item.isCorrect ? '正确' : '错误' }}
              </el-tag>
            </div>
            <div class="flex items-center gap-12px">
              <span class="text-14px text-gray-500">得分：{{ item.score }} 分</span>
              <Icon
                :icon="expandedItems[item.questionId] ? 'ep:arrow-up' : 'ep:arrow-down'"
                class="text-gray-400"
              />
            </div>
          </div>

          <!-- 题目详情 -->
          <div v-show="expandedItems[item.questionId]" class="p-20px">
            <div class="text-16px mb-16px leading-relaxed">{{ item.questionContent }}</div>

            <div class="space-y-12px mb-16px">
              <div class="flex items-center gap-8px">
                <span class="text-14px text-gray-500 w-80px">你的答案：</span>
                <span
                  class="font-medium"
                  :class="item.isCorrect ? 'text-green-600' : 'text-red-600'"
                >
                  {{ item.userAnswer || '未作答' }}
                </span>
              </div>
              <div class="flex items-center gap-8px">
                <span class="text-14px text-gray-500 w-80px">正确答案：</span>
                <span class="font-medium text-green-600">{{ item.correctAnswer }}</span>
              </div>
            </div>

            <div class="bg-gray-50 rounded-8px p-16px">
              <div class="text-14px text-gray-500 mb-8px">答案解析</div>
              <div class="text-15px leading-relaxed">{{ item.analysis || '暂无解析' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@/components/Icon'
import { ElMessage } from 'element-plus'
import { ExerciseApi, type ExerciseResultRespVO } from '@/api/study/exercise'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const result = ref<ExerciseResultRespVO>()
const expandedItems = ref<Record<number, boolean>>({})

// 计算属性
const wrongCount = computed(() => {
  return (result.value?.totalCount || 0) - (result.value?.correctCount || 0)
})

// 方法
const toggleExpand = (questionId: number) => {
  expandedItems.value[questionId] = !expandedItems.value[questionId]
}

const handleBack = () => {
  router.push('/study/course')
}

const handleViewWrongBook = () => {
  router.push('/study/wrongbook')
}

const handleRetry = () => {
  // 重新生成练习
  ElMessage.success('功能开发中，请从课程页面重新生成练习')
}

// 加载结果
const loadResult = async () => {
  const exerciseId = route.query.id as string
  if (!exerciseId) {
    ElMessage.error('练习ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await ExerciseApi.completeExercise(Number(exerciseId))
    result.value = res
  } catch (error) {
    ElMessage.error('加载结果失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadResult()
})
</script>

<style scoped>
:deep(.el-tag) {
  border-radius: 4px;
}
</style>
