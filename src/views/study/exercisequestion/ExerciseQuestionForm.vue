<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="700px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 所属练习 -->
      <el-form-item label="所属练习" prop="exerciseId">
        <el-select
          v-model="formData.exerciseId"
          placeholder="请选择所属练习"
          clearable
          filterable
          remote
          :remote-method="fetchExerciseList"
          :loading="exerciseLoading"
          class="w-full"
          @focus="fetchExerciseList('')"
        >
          <el-option
            v-for="item in exerciseList"
            :key="item.id"
            :label="item.exerciseName"
            :value="item.id"
          />
        </el-select>
        <div class="text-12px text-gray-400 mt-4px">
          选择练习后，该题目将归属于指定练习
        </div>
      </el-form-item>

      <!-- 题型 -->
      <el-form-item label="题型" prop="questionType">
        <el-select v-model="formData.questionType" placeholder="请选择题型" class="w-full">
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.QUESTION_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>

      <!-- 题目内容 -->
      <el-form-item label="题目内容" prop="questionContent">
        <Editor
          v-model="formData.questionContent"
          :height="150"
          placeholder="请输入题目内容，支持富文本格式"
        />
        <div class="text-12px text-gray-400 mt-4px">
          支持富文本格式，可插入代码、公式等
        </div>
      </el-form-item>

      <!-- 选项编辑器（单选/判断时显示） -->
      <el-form-item v-if="showOptionsEditor" label="选项" prop="options">
        <div class="options-editor">
          <!-- 选项列表 -->
          <div
            v-for="(option, index) in optionsList"
            :key="option.key"
            class="option-item"
            :class="{ 'is-correct': formData.correctAnswer === option.key }"
          >
            <div class="option-key">{{ option.key }}</div>
            <el-input
              v-model="option.value"
              :placeholder="`请输入选项${option.key}内容`"
              class="option-input"
              maxlength="200"
            />
            <el-button
              v-if="canDeleteOption"
              type="danger"
              link
              @click="removeOption(index)"
            >
              <Icon icon="ep:delete" />
            </el-button>
          </div>

          <!-- 添加选项按钮 -->
          <el-button
            v-if="canAddOption"
            type="primary"
            link
            class="add-option-btn"
            @click="addOption"
          >
            <Icon icon="ep:plus" class="mr-4px" />
            添加选项
          </el-button>

          <!-- 提示信息 -->
          <div class="text-12px text-gray-400 mt-8px">
            <Icon icon="ep:info-filled" class="mr-4px" />
            {{ optionTipText }}
          </div>
        </div>
      </el-form-item>

      <!-- 正确答案 -->
      <el-form-item label="正确答案" prop="correctAnswer">
        <!-- 单选题：选项按钮组 -->
        <el-radio-group
          v-if="formData.questionType === 1"
          v-model="formData.correctAnswer"
          class="answer-radio-group"
        >
          <el-radio-button
            v-for="option in optionsList"
            :key="option.key"
            :label="option.key"
            :value="option.key"
          >
            {{ option.key }}
          </el-radio-button>
        </el-radio-group>

        <!-- 判断题：正确/错误 -->
        <el-radio-group
          v-else-if="formData.questionType === 2"
          v-model="formData.correctAnswer"
        >
          <el-radio label="A" value="A">正确</el-radio>
          <el-radio label="B" value="B">错误</el-radio>
        </el-radio-group>

        <!-- 简答题：文本输入 -->
        <el-input
          v-else
          v-model="formData.correctAnswer"
          type="textarea"
          :rows="3"
          placeholder="请输入参考答案"
        />
      </el-form-item>

      <!-- 答案解析 -->
      <el-form-item label="答案解析" prop="analysis">
        <Editor
          v-model="formData.analysis"
          :height="120"
          placeholder="请输入答案解析（可选），支持富文本格式"
        />
      </el-form-item>

      <!-- 关联知识点 -->
      <el-form-item label="关联知识点" prop="knowledgePointId">
        <el-tree-select
          v-model="formData.knowledgePointId"
          :data="knowledgeTreeData"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          :render-after-expand="false"
          filterable
          clearable
          placeholder="请选择关联知识点"
          class="w-full"
          :loading="knowledgeLoading"
        />
        <div class="text-12px text-gray-400 mt-4px">
          关联知识点后，可按知识点进行针对性练习
        </div>
      </el-form-item>

      <!-- 来源类型 -->
      <el-form-item label="来源类型" prop="sourceType">
        <el-select v-model="formData.sourceType" placeholder="请选择来源类型" class="w-full">
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.SOURCE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>

      <!-- 是否AI生成 -->
      <el-form-item label="AI生成" prop="aiGenerated">
        <el-radio-group v-model="formData.aiGenerated">
          <el-radio :label="true" :value="true">是</el-radio>
          <el-radio :label="false" :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          placeholder="数字越小越靠前"
          class="w-full"
        />
        <div class="text-12px text-gray-400 mt-4px">
          数字越小排序越靠前，用于控制题目在练习中的展示顺序
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="formLoading" @click="submitForm">
        确 定
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { Editor } from '@/components/Editor'
import { ExerciseQuestionApi, ExerciseQuestion } from '@/api/study/exercisequestion'
import { ExerciseApi } from '@/api/study/exercise'
import { CourseKnowledgeApi } from '@/api/study/courseknowledge'
import { CourseChapterApi } from '@/api/study/coursechapter'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { ElMessage } from 'element-plus'

/** 练习题 表单 */
defineOptions({ name: 'ExerciseQuestionForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

// 表单数据
const formData = ref({
  id: undefined,
  exerciseId: undefined,
  questionType: undefined,
  questionContent: '',
  optionsJson: '',
  correctAnswer: '',
  analysis: '',
  knowledgePointId: undefined,
  sourceType: 2, // 默认预置题
  aiGenerated: false,
  sort: 0,
})

// 选项列表（用于编辑）
const optionsList = ref<Array<{ key: string; value: string }>>([])

// 练习列表
const exerciseList = ref<any[]>([])
const exerciseLoading = ref(false)

// 知识点树
const knowledgeTreeData = ref<any[]>([])
const knowledgeLoading = ref(false)

// 表单校验规则
const formRules = reactive({
  exerciseId: [{ required: true, message: '请选择所属练习', trigger: 'change' }],
  questionType: [{ required: true, message: '请选择题型', trigger: 'change' }],
  questionContent: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  correctAnswer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请选择来源类型', trigger: 'change' }],
})

const formRef = ref()

// 是否显示选项编辑器
const showOptionsEditor = computed(() => {
  return formData.value.questionType === 1 || formData.value.questionType === 2
})

// 是否可以添加选项
const canAddOption = computed(() => {
  if (formData.value.questionType === 2) return false // 判断题固定2个选项
  return optionsList.value.length < 6
})

// 是否可以删除选项
const canDeleteOption = computed(() => {
  if (formData.value.questionType === 2) return false // 判断题固定2个选项
  return optionsList.value.length > 2
})

// 选项提示文字
const optionTipText = computed(() => {
  if (formData.value.questionType === 2) {
    return '判断题固定A=正确、B=错误两个选项'
  }
  return '最少2个选项，最多6个选项；点击选项字母可设置为正确答案'
})

// 监听题型变化
watch(
  () => formData.value.questionType,
  (newType) => {
    if (newType === 2) {
      // 判断题：固定A/B两个选项
      optionsList.value = [
        { key: 'A', value: '正确' },
        { key: 'B', value: '错误' },
      ]
      formData.value.correctAnswer = ''
    } else if (newType === 1) {
      // 单选题：默认A/B/C/D四个选项
      if (optionsList.value.length < 2 || optionsList.value.length > 6) {
        optionsList.value = [
          { key: 'A', value: '' },
          { key: 'B', value: '' },
          { key: 'C', value: '' },
          { key: 'D', value: '' },
        ]
      }
      formData.value.correctAnswer = ''
    } else if (newType === 3) {
      // 简答题：清空选项和正确答案
      optionsList.value = []
      formData.value.correctAnswer = ''
    }
  }
)

// 监听选项列表变化，更新optionsJson
watch(
  optionsList,
  (newOptions) => {
    if (newOptions.length > 0) {
      const optionsObj: Record<string, string> = {}
      newOptions.forEach((opt) => {
        if (opt.value.trim()) {
          optionsObj[opt.key] = opt.value.trim()
        }
      })
      formData.value.optionsJson = JSON.stringify(optionsObj)
    } else {
      formData.value.optionsJson = ''
    }
  },
  { deep: true }
)

// 添加选项
const addOption = () => {
  if (optionsList.value.length >= 6) {
    ElMessage.warning('最多只能添加6个选项')
    return
  }
  const nextKey = String.fromCharCode(65 + optionsList.value.length) // A, B, C...
  optionsList.value.push({ key: nextKey, value: '' })
}

// 删除选项
const removeOption = (index: number) => {
  if (optionsList.value.length <= 2) {
    ElMessage.warning('至少需要保留2个选项')
    return
  }
  const removedKey = optionsList.value[index].key
  optionsList.value.splice(index, 1)

  // 重新编号
  optionsList.value.forEach((opt, idx) => {
    opt.key = String.fromCharCode(65 + idx)
  })

  // 如果删除的是当前正确答案，清空正确答案
  if (formData.value.correctAnswer === removedKey) {
    formData.value.correctAnswer = ''
  }
}

// 解析optionsJson到optionsList
const parseOptionsJson = (json: string) => {
  if (!json) return
  try {
    const obj = JSON.parse(json)
    const list: Array<{ key: string; value: string }> = []
    Object.keys(obj).forEach((key) => {
      list.push({ key, value: obj[key] })
    })
    // 按A-Z排序
    list.sort((a, b) => a.key.charCodeAt(0) - b.key.charCodeAt(0))
    optionsList.value = list
  } catch (e) {
    console.error('解析选项JSON失败:', e)
    optionsList.value = []
  }
}

// 搜索练习列表
const fetchExerciseList = async (query: string) => {
  exerciseLoading.value = true
  try {
    const data = await ExerciseApi.getExercisePage({
      pageNo: 1,
      pageSize: 20,
      exerciseName: query,
    })
    exerciseList.value = data.list
  } finally {
    exerciseLoading.value = false
  }
}

// 加载知识点树
const loadKnowledgeTree = async () => {
  knowledgeLoading.value = true
  try {
    // 先获取所有课程
    const courses = await CourseChapterApi.getSimpleCourseList()
    const treeData: any[] = []

    for (const course of courses) {
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
          // 章级别
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
  } finally {
    knowledgeLoading.value = false
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增习题' : '编辑习题'
  formType.value = type
  resetForm()

  // 加载基础数据
  await loadKnowledgeTree()

  // 修改时加载数据
  if (id) {
    formLoading.value = true
    try {
      const data = await ExerciseQuestionApi.getExerciseQuestion(id)
      formData.value = {
        ...data,
        questionType: data.questionType,
        sourceType: data.sourceType,
        aiGenerated: data.aiGenerated,
      }

      // 解析选项JSON
      if (data.optionsJson) {
        parseOptionsJson(data.optionsJson)
      }

      // 加载练习信息
      if (data.exerciseId) {
        await fetchExerciseList('')
      }
    } finally {
      formLoading.value = false
    }
  } else {
    // 新增时初始化选项
    formData.value.questionType = 1
    optionsList.value = [
      { key: 'A', value: '' },
      { key: 'B', value: '' },
      { key: 'C', value: '' },
      { key: 'D', value: '' },
    ]
  }
}

defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()

  // 校验选项
  if (formData.value.questionType === 1 || formData.value.questionType === 2) {
    const validOptions = optionsList.value.filter((opt) => opt.value.trim())
    if (validOptions.length < 2) {
      ElMessage.warning('至少需要填写2个选项')
      return
    }
    if (!formData.value.correctAnswer) {
      ElMessage.warning('请选择正确答案')
      return
    }
    // 检查正确答案是否在选项中
    const correctOption = optionsList.value.find(
      (opt) => opt.key === formData.value.correctAnswer && opt.value.trim()
    )
    if (!correctOption) {
      ElMessage.warning('正确答案对应的选项内容不能为空')
      return
    }
  }

  formLoading.value = true
  try {
    const data = formData.value as unknown as ExerciseQuestion
    if (formType.value === 'create') {
      await ExerciseQuestionApi.createExerciseQuestion(data)
      message.success(t('common.createSuccess'))
    } else {
      await ExerciseQuestionApi.updateExerciseQuestion(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    exerciseId: undefined,
    questionType: undefined,
    questionContent: '',
    optionsJson: '',
    correctAnswer: '',
    analysis: '',
    knowledgePointId: undefined,
    sourceType: 2,
    aiGenerated: false,
    sort: 0,
  }
  optionsList.value = []
  exerciseList.value = []
  formRef.value?.resetFields()
}
</script>

<style scoped>
.options-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.3s;
}

.option-item.is-correct {
  border: 1px solid var(--el-color-success);
  background-color: var(--el-color-success-light-9);
}

.option-key {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.is-correct .option-key {
  background-color: var(--el-color-success);
}

.option-input {
  flex: 1;
}

.add-option-btn {
  margin-top: 8px;
}

.answer-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.answer-radio-group .el-radio-button__inner) {
  width: 40px;
  padding: 8px 0;
  font-weight: bold;
}
</style>
