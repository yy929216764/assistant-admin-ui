<template>
  <div class="h-[calc(100vh-120px)] overflow-y-auto bg-white rounded-lg shadow-sm p-24px">
    <div class="max-w-900px mx-auto">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-24px">
        <div class="flex items-center gap-12px">
          <el-button link @click="handleBack">
            <Icon icon="ep:arrow-left" class="mr-4px" />
            返回
          </el-button>
          <span class="text-20px font-bold">错题详情</span>
        </div>
        <div class="flex items-center gap-8px">
          <el-tag v-if="wrongBook?.masterStatus === 1" type="success">已掌握</el-tag>
          <el-tag v-else type="warning">未掌握</el-tag>
          <el-tag type="info">错误 {{ wrongBook?.wrongCount || 1 }} 次</el-tag>
        </div>
      </div>

      <!-- 错题内容 -->
      <div v-if="wrongBook" class="space-y-24px">
        <!-- 题目卡片 -->
        <div class="border rounded-12px p-24px">
          <div class="flex items-center gap-8px mb-16px">
            <el-tag :type="questionTypeTag">{{ questionTypeText }}</el-tag>
            <span class="text-14px text-gray-400">最后错误时间：{{ formatDate(wrongBook.lastWrongTime) }}</span>
          </div>

          <div class="text-18px font-medium leading-relaxed mb-20px">
            {{ wrongBook.questionContent }}
          </div>

          <!-- 选项 -->
          <div v-if="options" class="space-y-12px mb-20px">
            <div
              v-for="(value, key) in options"
              :key="key"
              class="flex items-center p-12px rounded-8px"
              :class="getOptionClass(key)"
            >
              <div
                class="w-28px h-28px rounded-full flex items-center justify-center mr-12px font-bold text-14px"
                :class="getOptionKeyClass(key)"
              >
                {{ key }}
              </div>
              <span class="text-15px">{{ value }}</span>
            </div>
          </div>

          <!-- 答案对比 -->
          <div class="bg-gray-50 rounded-8px p-16px space-y-12px">
            <div class="flex items-center gap-12px">
              <span class="text-14px text-gray-500 w-80px">你的答案：</span>
              <span class="font-medium text-red-600">{{ wrongBook.userAnswer || '未作答' }}</span>
            </div>
            <div class="flex items-center gap-12px">
              <span class="text-14px text-gray-500 w-80px">正确答案：</span>
              <span class="font-medium text-green-600">{{ wrongBook.correctAnswer }}</span>
            </div>
          </div>
        </div>

        <!-- 题目解析 -->
        <div class="border rounded-12px p-24px">
          <div class="text-16px font-bold mb-16px flex items-center gap-8px">
            <Icon icon="ep:document" />
            题目解析
          </div>
          <div class="text-15px leading-relaxed">{{ wrongBook.questionAnalysis || '暂无解析' }}</div>
        </div>

        <!-- AI错因分析 -->
        <div class="border rounded-12px p-24px" :class="analysisBorderClass">
          <div class="flex items-center justify-between mb-16px">
            <div class="text-16px font-bold flex items-center gap-8px">
              <Icon icon="ep:magic-stick" class="text-purple-500" />
              AI错因分析
            </div>
            <el-button
              v-if="!wrongBook.aiAnalysis && !analyzing"
              type="primary"
              size="small"
              @click="handleAnalyze"
            >
              <Icon icon="ep:video-play" class="mr-4px" />
              开始分析
            </el-button>
            <el-button v-if="analyzing" type="primary" size="small" loading>
              分析中...
            </el-button>
          </div>

          <!-- 分析结果 -->
          <div v-if="wrongBook.aiAnalysis || analyzing">
            <div v-if="analyzing" class="text-center py-24px">
              <el-icon class="is-loading text-32px text-primary mb-12px">
                <Loading />
              </el-icon>
              <div class="text-14px text-gray-500">AI正在分析错因，请稍候...</div>
            </div>
            <div v-else class="space-y-16px">
              <!-- 错误原因 -->
              <div v-if="wrongBook.aiAnalysis" class="bg-red-50 rounded-8px p-16px">
                <div class="text-14px font-medium text-red-600 mb-8px">错误原因</div>
                <div class="text-15px leading-relaxed">{{ wrongBook.aiAnalysis }}</div>
              </div>

              <!-- 复习建议 -->
              <div v-if="wrongBook.reviewSuggestion" class="bg-blue-50 rounded-8px p-16px">
                <div class="text-14px font-medium text-blue-600 mb-8px">复习建议</div>
                <div class="text-15px leading-relaxed">{{ wrongBook.reviewSuggestion }}</div>
              </div>
            </div>
          </div>

          <!-- 未分析状态 -->
          <div v-else class="text-center py-32px text-gray-400">
            <Icon icon="ep:magic-stick" class="text-48px mb-12px" />
            <div>点击"开始分析"获取AI错因分析与学习建议</div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-center gap-16px pt-16px">
          <el-button @click="handleBack">
            <Icon icon="ep:back" class="mr-4px" />
            返回列表
          </el-button>
          <el-button v-if="wrongBook.masterStatus !== 1" type="success" @click="handleMaster">
            <Icon icon="ep:check" class="mr-4px" />
            标记已掌握
          </el-button>
          <el-button type="primary" @click="handleRetry">
            <Icon icon="ep:refresh" class="mr-4px" />
            重新练习
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="错题加载失败" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@/components/Icon'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { WrongBookApi, type WrongBook } from '@/api/study/wrongbook'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const analyzing = ref(false)
const wrongBook = ref<WrongBook>()

// 计算属性
const questionTypeText = computed(() => {
  const type = wrongBook.value?.questionType
  switch (type) {
    case 1: return '单选题'
    case 2: return '判断题'
    case 3: return '简答题'
    default: return '未知题型'
  }
})

const questionTypeTag = computed(() => {
  const type = wrongBook.value?.questionType
  switch (type) {
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'warning'
    default: return 'info'
  }
})

const options = computed(() => {
  if (!wrongBook.value?.optionsJson) return null
  try {
    return JSON.parse(wrongBook.value.optionsJson)
  } catch {
    return null
  }
})

const analysisBorderClass = computed(() => {
  return wrongBook.value?.aiAnalysis ? 'border-purple-200' : 'border-gray-200'
})

// 方法
const getOptionClass = (key: string) => {
  const userAnswer = wrongBook.value?.userAnswer
  const correctAnswer = wrongBook.value?.correctAnswer

  if (key === correctAnswer) {
    return 'bg-green-50 border border-green-200'
  }
  if (key === userAnswer) {
    return 'bg-red-50 border border-red-200'
  }
  return 'bg-gray-50'
}

const getOptionKeyClass = (key: string) => {
  const userAnswer = wrongBook.value?.userAnswer
  const correctAnswer = wrongBook.value?.correctAnswer

  if (key === correctAnswer) {
    return 'bg-green-500 text-white'
  }
  if (key === userAnswer) {
    return 'bg-red-500 text-white'
  }
  return 'bg-gray-200 text-gray-600'
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const handleAnalyze = async () => {
  if (!wrongBook.value) return

  analyzing.value = true
  try {
    const res = await WrongBookApi.analyzeWrongBook(wrongBook.value.id)
    ElMessage.success('AI分析完成')

    // 更新本地数据
    wrongBook.value.aiAnalysis = res
    // 重新获取完整数据
    await loadWrongBookDetail()
  } catch (error) {
    ElMessage.error('AI分析失败')
  } finally {
    analyzing.value = false
  }
}

const handleMaster = async () => {
  if (!wrongBook.value) return

  try {
    await ElMessageBox.confirm('确定将此题标记为已掌握吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    await WrongBookApi.masterWrongBook(wrongBook.value.id)
    wrongBook.value.masterStatus = 1
    ElMessage.success('已标记为掌握')
  } catch (error) {
    // 用户取消
  }
}

const handleRetry = async () => {
  if (!wrongBook.value) return

  try {
    const res = await WrongBookApi.retryWrongBook([wrongBook.value.id])
    ElMessage.success('错题练习已生成')
    // 跳转到练习页面
    router.push({
      path: '/study/exercise/do',
      query: { id: res }
    })
  } catch (error) {
    ElMessage.error('生成练习失败')
  }
}

const handleBack = () => {
  router.push('/study/wrongbook')
}

// 加载错题详情
const loadWrongBookDetail = async () => {
  const id = route.query.id as string
  if (!id) {
    ElMessage.error('错题ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await WrongBookApi.getWrongBook(Number(id))
    wrongBook.value = res
  } catch (error) {
    ElMessage.error('加载错题失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWrongBookDetail()
})
</script>

<style scoped>
:deep(.el-tag) {
  border-radius: 4px;
}
</style>
