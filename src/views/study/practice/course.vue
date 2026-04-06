<template>
  <ContentWrap>
    <!-- 返回按钮和标题 -->
    <div class="page-header">
      <el-button link @click="goBack">
        <Icon icon="ep:arrow-left" class="mr-4px" />
        返回课程列表
      </el-button>
    </div>

    <!-- 课程信息卡片 -->
    <div class="course-hero" v-loading="courseLoading">
      <div class="hero-content">
        <div class="course-cover-large">
          <img
            v-if="courseInfo?.courseCover"
            :src="courseInfo.courseCover"
            :alt="courseInfo.courseName"
          />
          <div v-else class="cover-placeholder-large">
            <Icon icon="ep:collection" />
          </div>
        </div>
        <div class="course-meta">
          <h1 class="course-title">{{ courseInfo?.courseName || '加载中...' }}</h1>
          <p class="course-description">{{ courseInfo?.courseIntro || '暂无简介' }}</p>
          <div class="course-tags">
            <el-tag :type="getDifficultyType(courseInfo?.difficultyLevel)" size="large">
              <Icon icon="ep:star" class="mr-4px" />
              {{ getDifficultyLabel(courseInfo?.difficultyLevel) }}
            </el-tag>
            <el-tag v-if="wrongCount > 0" type="danger" size="large" effect="plain">
              <Icon icon="ep:warning" class="mr-4px" />
              {{ wrongCount }} 道错题待复习
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </ContentWrap>

  <!-- 练习模式选择 -->
  <ContentWrap title="选择练习模式">
    <div class="practice-modes">
      <!-- 模式1：机构试题练习 -->
      <div
        class="mode-card"
        :class="{ active: selectedMode === 'preset' }"
        @click="selectMode('preset')"
      >
        <div class="mode-icon preset">
          <Icon icon="ep:document" />
        </div>
        <div class="mode-content">
          <h3 class="mode-title">机构试题练习</h3>
          <p class="mode-desc">使用机构预设的精选练习题，系统性强，覆盖面广</p>
          <div class="mode-info">
            <el-tag type="info" size="small">
              <Icon icon="ep:check" class="mr-4px" />
              {{ presetExerciseCount }} 个可用练习
            </el-tag>
          </div>
        </div>
        <div class="mode-check" v-if="selectedMode === 'preset'">
          <Icon icon="ep:check" class="check-icon" />
        </div>
      </div>

      <!-- 模式2：AI智能生成 -->
      <div
        class="mode-card"
        :class="{ active: selectedMode === 'ai' }"
        @click="selectMode('ai')"
      >
        <div class="mode-icon ai">
          <Icon icon="ep:cpu" />
        </div>
        <div class="mode-content">
          <h3 class="mode-title">AI智能生成</h3>
          <p class="mode-desc">根据课程内容AI智能生成个性化练习题，针对性强</p>
          <div class="mode-info">
            <el-tag type="success" size="small">
              <Icon icon="ep:magic-stick" class="mr-4px" />
              智能出题
            </el-tag>
          </div>
        </div>
        <div class="mode-check" v-if="selectedMode === 'ai'">
          <Icon icon="ep:check" class="check-icon" />
        </div>
      </div>

      <!-- 模式3：错题重练 -->
      <div
        class="mode-card"
        :class="{ active: selectedMode === 'wrong', disabled: wrongCount === 0 }"
        @click="wrongCount > 0 && selectMode('wrong')"
      >
        <div class="mode-icon wrong">
          <Icon icon="ep:refresh" />
        </div>
        <div class="mode-content">
          <h3 class="mode-title">错题重练</h3>
          <p class="mode-desc">针对性复习历史错题，巩固薄弱环节，提升学习效果</p>
          <div class="mode-info">
            <el-tag :type="wrongCount > 0 ? 'danger' : 'info'" size="small">
              <Icon icon="ep:warning" class="mr-4px" />
              {{ wrongCount > 0 ? `${wrongCount} 道错题待复习` : '暂无错题' }}
            </el-tag>
          </div>
        </div>
        <div class="mode-check" v-if="selectedMode === 'wrong'">
          <Icon icon="ep:check" class="check-icon" />
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="selectedMode" class="config-panel">
      <el-divider />
      <h4 class="config-title">
        <Icon icon="ep:setting" class="mr-8px" />
        练习配置
      </h4>

      <!-- 机构试题 - 选择练习 -->
      <template v-if="selectedMode === 'preset'">
        <el-form :model="presetConfig" label-width="100px">
          <el-form-item label="选择练习">
            <el-select
              v-model="presetConfig.exerciseId"
              placeholder="请选择要进行的练习"
              class="w-full"
              style="max-width: 400px"
            >
              <el-option
                v-for="ex in presetExerciseList"
                :key="ex.id"
                :label="ex.exerciseName"
                :value="ex.id"
              >
                <div class="exercise-option">
                  <span>{{ ex.exerciseName }}</span>
                  <el-tag size="small" type="info">{{ ex.questionCount }} 题</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- AI生成 - 配置参数 -->
      <template v-if="selectedMode === 'ai'">
        <el-alert
          title="AI正在根据课程内容智能生成练习题，可能需要30-60秒，请耐心等待"
          type="info"
          :closable="false"
          show-icon
          class="mb-16px"
        />
        <el-form :model="aiConfig" label-width="100px">
          <el-form-item label="题目数量">
            <el-slider
              v-model="aiConfig.questionCount"
              :min="5"
              :max="20"
              :step="5"
              show-stops
              show-input
              style="max-width: 400px"
            />
          </el-form-item>
          <el-form-item label="关联知识点">
            <el-tree-select
              v-model="aiConfig.knowledgePointId"
              :data="knowledgeTreeData"
              :props="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="选择特定知识点（可选）"
              clearable
              filterable
              class="w-full"
              style="max-width: 400px"
            />
          </el-form-item>
          <el-form-item label="生成模型">
            <el-select
              v-model="aiConfig.modelId"
              placeholder="选择AI模型"
              class="w-full"
              style="max-width: 400px"
            >
              <el-option
                v-for="model in modelList"
                :key="model.id"
                :label="model.modelName"
                :value="model.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- 错题重练 - 选择错题 -->
      <template v-if="selectedMode === 'wrong'">
        <el-alert
          title="将从您的错题本中随机抽取错题组成新练习"
          type="info"
          :closable="false"
          show-icon
          class="mb-16px"
        />
        <el-form :model="wrongConfig" label-width="100px">
          <el-form-item label="错题数量">
            <el-slider
              v-model="wrongConfig.questionCount"
              :min="1"
              :max="Math.min(wrongCount, 20)"
              :step="1"
              show-input
              style="max-width: 400px"
            />
          </el-form-item>
        </el-form>
      </template>

      <!-- 开始按钮 -->
      <div class="action-area">
        <el-button size="large" @click="selectedMode = null">重新选择</el-button>
        <el-button
          type="primary"
          size="large"
          :loading="startLoading"
          :disabled="!canStart"
          @click="startPractice"
        >
          <Icon icon="ep:video-play" class="mr-4px" />
          {{ startButtonText }}
        </el-button>
      </div>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { CourseApi } from '@/api/study/course'
import { ExerciseApi } from '@/api/study/exercise'
import { WrongBookApi } from '@/api/study/wrongbook'
import { CourseKnowledgeApi } from '@/api/study/courseknowledge'
import { CourseChapterApi } from '@/api/study/coursechapter'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'CoursePractice' })

const route = useRoute()
const router = useRouter()
const message = useMessage()

const courseId = ref<number>(Number(route.query.courseId))
const courseName = ref<string>(String(route.query.courseName || ''))

const courseLoading = ref(false)
const courseInfo = ref<any>(null)
const wrongCount = ref(0)
const presetExerciseCount = ref(0)
const presetExerciseList = ref<any[]>([])
const knowledgeTreeData = ref<any[]>([])
const modelList = ref<any[]>([])

const selectedMode = ref<'preset' | 'ai' | 'wrong' | null>(null)
const startLoading = ref(false)

// 配置表单
const presetConfig = reactive({
  exerciseId: undefined as number | undefined,
})

const aiConfig = reactive({
  questionCount: 10,
  knowledgePointId: undefined as number | undefined,
  modelId: undefined as number | undefined,
})

const wrongConfig = reactive({
  questionCount: 5,
})

// 难度等级映射
const difficultyMap: Record<number, { label: string; type: string }> = {
  1: { label: '初级', type: 'success' },
  2: { label: '中级', type: 'warning' },
  3: { label: '高级', type: 'danger' },
}

const getDifficultyLabel = (level?: number) => {
  return difficultyMap[level || 1]?.label || '初级'
}

const getDifficultyType = (level?: number) => {
  return difficultyMap[level || 1]?.type || 'success'
}

/** 获取课程详情 */
const getCourseInfo = async () => {
  courseLoading.value = true
  try {
    const data = await CourseApi.getCourse(courseId.value)
    courseInfo.value = data
    courseName.value = data.courseName
  } finally {
    courseLoading.value = false
  }
}

/** 获取错题统计 */
const getWrongCount = async () => {
  try {
    const data = await WrongBookApi.getWrongBookPage({
      courseId: courseId.value,
      masterStatus: 0,
      pageNo: 1,
      pageSize: 1,
    })
    wrongCount.value = data.total || 0
    // 设置错题重练的最大数量
    wrongConfig.questionCount = Math.min(5, wrongCount.value)
  } catch {
    wrongCount.value = 0
  }
}

/** 获取机构预设练习列表 */
const getPresetExercises = async () => {
  try {
    const data = await ExerciseApi.getExercisePage({
      courseId: courseId.value,
      exerciseType: 2, // 固定练习
      pageNo: 1,
      pageSize: 100,
    })
    presetExerciseList.value = data.list || []
    presetExerciseCount.value = data.total || 0
  } catch {
    presetExerciseList.value = []
    presetExerciseCount.value = 0
  }
}

/** 加载知识点树 */
const loadKnowledgeTree = async () => {
  try {
    // 先获取所有课程
    const courses = await CourseChapterApi.getSimpleCourseList()
    const treeData: any[] = []

    for (const course of courses) {
      if (course.id !== courseId.value) continue

      const courseNode: any = {
        id: `course-${course.id}`,
        name: `📚 ${course.courseName}`,
        disabled: true,
        children: [],
      }

      // 获取该课程的章节
      const chapters = await CourseChapterApi.getSimpleChapterList({ courseId: course.id })
      for (const chapter of chapters) {
        if (chapter.chapterLevel === 1) {
          const chapterNode: any = {
            id: `chapter-${chapter.id}`,
            name: `📁 ${chapter.chapterName}`,
            disabled: true,
            children: [],
          }

          // 获取该章节下的知识点
          const knowledges = await CourseKnowledgeApi.getSimpleKnowledgeList({
            courseId: course.id,
            chapterId: chapter.id,
          })

          for (const knowledge of knowledges) {
            chapterNode.children.push({
              id: knowledge.id,
              name: `💡 ${knowledge.knowledgePointName}`,
            })
          }

          if (chapterNode.children.length > 0) {
            courseNode.children.push(chapterNode)
          }
        }
      }

      if (courseNode.children.length > 0) {
        treeData.push(courseNode)
      }
    }

    knowledgeTreeData.value = treeData
  } catch (error) {
    console.error('加载知识点树失败:', error)
  }
}

/** 获取模型列表 */
const getModelList = async () => {
  try {
    // 这里应该调用模型API，暂时使用空列表
    // 实际项目中应该调用 AiModelApi.getModelPage 等接口
    modelList.value = []
    // 如果有默认模型，设置默认值
    if (courseInfo.value?.defaultModelId) {
      aiConfig.modelId = courseInfo.value.defaultModelId
    }
  } catch {
    modelList.value = []
  }
}

/** 选择模式 */
const selectMode = (mode: 'preset' | 'ai' | 'wrong') => {
  selectedMode.value = mode
}

/** 是否可以开始 */
const canStart = computed(() => {
  if (!selectedMode.value) return false

  switch (selectedMode.value) {
    case 'preset':
      return !!presetConfig.exerciseId
    case 'ai':
      return aiConfig.questionCount > 0
    case 'wrong':
      return wrongCount.value > 0 && wrongConfig.questionCount > 0
    default:
      return false
  }
})

/** 开始按钮文本 */
const startButtonText = computed(() => {
  if (startLoading.value) {
    switch (selectedMode.value) {
      case 'ai':
        return 'AI生成中，请稍候...'
      default:
        return '加载中...'
    }
  }
  switch (selectedMode.value) {
    case 'preset':
      return '开始练习'
    case 'ai':
      return '生成并开始'
    case 'wrong':
      return '开始错题重练'
    default:
      return '开始'
  }
})

/** 开始练习 */
const startPractice = async () => {
  startLoading.value = true
  try {
    let exerciseId: number

    switch (selectedMode.value) {
      case 'preset':
        // 使用预设练习
        exerciseId = presetConfig.exerciseId!
        // 跳转到做题页面
        router.push({
          path: '/study/exercise/do',
          query: { id: exerciseId },
        })
        break

      case 'ai':
        // 调用AI生成接口
        exerciseId = await ExerciseApi.generateExercise({
          courseId: courseId.value,
          knowledgePointId: aiConfig.knowledgePointId,
          questionCount: aiConfig.questionCount,
          modelId: aiConfig.modelId,
        })
        message.success('练习生成成功')
        // 跳转到做题页面
        router.push({
          path: '/study/exercise/do',
          query: { id: exerciseId },
        })
        break

      case 'wrong':
        // 获取错题列表并生成练习
        const wrongBookData = await WrongBookApi.getWrongBookPage({
          courseId: courseId.value,
          masterStatus: 0,
          pageNo: 1,
          pageSize: wrongConfig.questionCount,
        })
        const wrongBookIds = wrongBookData.list.map((item: any) => item.id)
        if (wrongBookIds.length === 0) {
          message.warning('没有可复习的错题')
          return
        }
        exerciseId = await WrongBookApi.retryWrongBook(wrongBookIds)
        message.success('错题练习生成成功')
        // 跳转到做题页面
        router.push({
          path: '/study/exercise/do',
          query: { id: exerciseId },
        })
        break
    }
  } catch (error) {
    message.error('开始练习失败')
    console.error(error)
  } finally {
    startLoading.value = false
  }
}

/** 返回 */
const goBack = () => {
  router.push('/study/practice')
}

/** 初始化 */
onMounted(() => {
  if (!courseId.value) {
    message.error('课程ID不能为空')
    router.push('/study/practice')
    return
  }

  getCourseInfo()
  getWrongCount()
  getPresetExercises()
  loadKnowledgeTree()
  getModelList()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.course-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  color: #fff;
  margin-bottom: 24px;
}

.hero-content {
  display: flex;
  gap: 24px;
  align-items: center;
}

.course-cover-large {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder-large {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.6);
}

.course-meta {
  flex: 1;
}

.course-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.course-description {
  font-size: 15px;
  opacity: 0.9;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.course-tags {
  display: flex;
  gap: 12px;
}

.course-tags :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.practice-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.mode-card {
  position: relative;
  padding: 24px;
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 16px;
  background: #fff;
}

.mode-card:hover {
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.mode-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.mode-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-card.disabled:hover {
  transform: none;
  border-color: var(--el-border-color-lighter);
}

.mode-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.mode-icon.preset {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.mode-icon.ai {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.mode-icon.wrong {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.mode-content {
  flex: 1;
}

.mode-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.mode-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.mode-info {
  display: flex;
  gap: 8px;
}

.mode-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: #fff;
  font-size: 14px;
}

.config-panel {
  margin-top: 24px;
}

.config-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
}

.exercise-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-area {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .course-cover-large {
    width: 120px;
    height: 120px;
  }

  .course-title {
    font-size: 22px;
  }

  .practice-modes {
    grid-template-columns: 1fr;
  }

  .mode-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .mode-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}
</style>
