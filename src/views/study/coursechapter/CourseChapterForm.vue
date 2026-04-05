<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="560px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 所属课程 -->
      <el-form-item label="所属课程" prop="courseId">
        <el-select
          v-model="formData.courseId"
          placeholder="请选择课程"
          clearable
          filterable
          remote
          :remote-method="fetchCourseList"
          :loading="courseLoading"
          class="w-full"
          @focus="fetchCourseList('')"
          @change="handleCourseChange"
        >
          <el-option
            v-for="item in courseList"
            :key="item.id"
            :label="item.courseName"
            :value="item.id"
          />
        </el-select>
        <div class="text-12px text-gray-400 mt-4px">
          选择课程后，章节将归属于该课程
        </div>
      </el-form-item>

      <!-- 章节类型 - 可视化选择 -->
      <el-form-item label="章节类型" prop="chapterLevel">
        <div class="flex gap-12px">
          <div
            class="flex-1 p-16px border-2 rounded-8px cursor-pointer transition-all text-center"
            :class="formData.chapterLevel === 1 ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-gray-300'"
            @click="formData.chapterLevel = 1"
          >
            <Icon icon="ep:folder-opened" class="text-32px mb-8px" />
            <div class="font-medium">章（一级）</div>
            <div class="text-12px mt-4px opacity-70">如：第一章、第二章</div>
          </div>
          <div
            class="flex-1 p-16px border-2 rounded-8px cursor-pointer transition-all text-center"
            :class="formData.chapterLevel === 2 ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-gray-300'"
            @click="selectSection"
          >
            <Icon icon="ep:document" class="text-32px mb-8px" />
            <div class="font-medium">节（二级）</div>
            <div class="text-12px mt-4px opacity-70">如：1.1节、1.2节</div>
          </div>
        </div>
      </el-form-item>

      <!-- 所属章 - 仅当选择"节"时显示 -->
      <el-form-item v-if="formData.chapterLevel === 2" label="所属章" prop="parentId">
        <el-select
          v-model="formData.parentId"
          placeholder="请选择所属章"
          clearable
          class="w-full"
          :disabled="!formData.courseId || chapterList.length === 0"
        >
          <el-option
            v-for="chapter in chapterList"
            :key="chapter.id"
            :label="chapter.chapterName"
            :value="chapter.id"
          />
        </el-select>
        <div v-if="!formData.courseId" class="text-12px text-orange-400 mt-4px">
          <Icon icon="ep:warning" class="mr-4px" />
          请先选择所属课程
        </div>
        <div v-else-if="chapterList.length === 0" class="text-12px text-orange-400 mt-4px">
          <Icon icon="ep:warning" class="mr-4px" />
          该课程暂无"章"，请先创建章
        </div>
        <div v-else class="text-12px text-gray-400 mt-4px">
          选择该节所属的上级章节
        </div>
      </el-form-item>

      <!-- 章节名称 -->
      <el-form-item label="章节名称" prop="chapterName">
        <el-input
          v-model="formData.chapterName"
          :placeholder="namePlaceholder"
          maxlength="100"
          show-word-limit
        />
        <div class="text-12px text-gray-400 mt-4px">
          {{ nameTip }}
        </div>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="chapterOrder">
        <el-input-number
          v-model="formData.chapterOrder"
          :min="0"
          :max="999"
          placeholder="数字越小越靠前"
          class="w-full"
        />
        <div class="text-12px text-gray-400 mt-4px">
          数字越小排序越靠前，建议按顺序填写 0、1、2...
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
import { CourseChapterApi, CourseChapter } from '@/api/study/coursechapter'
import { CourseApi } from '@/api/study/course'
import { Icon } from '@/components/Icon'

/** 课程章节 表单 */
defineOptions({ name: 'CourseChapterForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('') // create - 新增；update - 修改

// 表单数据
const formData = ref({
  id: undefined,
  courseId: undefined,
  parentId: 0, // 0表示顶级（章），有值表示属于某章（节）
  chapterName: undefined,
  chapterOrder: 0,
  chapterLevel: 1, // 默认创建"章"
})

// 表单校验规则
const formRules = reactive({
  courseId: [{ required: true, message: '请选择所属课程', trigger: 'change' }],
  chapterName: [{ required: true, message: '请输入章节名称', trigger: 'blur' }],
  chapterLevel: [{ required: true, message: '请选择章节类型', trigger: 'change' }],
})

const formRef = ref()
const courseList = ref<any[]>([])
const courseLoading = ref(false)
const chapterList = ref<any[]>([]) // 当前课程的章列表

// 计算属性：名称输入提示
const namePlaceholder = computed(() => {
  return formData.value.chapterLevel === 1 ? '如：第一章 Java基础' : '如：1.1 Java简介'
})

// 计算属性：名称提示文字
const nameTip = computed(() => {
  return formData.value.chapterLevel === 1
    ? '建议使用"第一章"、"第二章"等命名方式'
    : '建议使用"1.1节"、"1.2节"等命名方式'
})

// 搜索课程列表
const fetchCourseList = async (query: string) => {
  courseLoading.value = true
  try {
    const data = await CourseApi.getCoursePage({
      pageNo: 1,
      pageSize: 20,
      courseName: query
    })
    courseList.value = data.list
  } finally {
    courseLoading.value = false
  }
}

// 课程选择变化
const handleCourseChange = async (courseId: number) => {
  formData.value.parentId = undefined
  chapterList.value = []

  if (!courseId) return

  // 加载该课程的章列表（用于选择父章节）
  try {
    const data = await CourseChapterApi.getCourseChapterPage({
      pageNo: 1,
      pageSize: 100,
      courseId: courseId,
    })
    // 只保留层级为1的（章）作为父章节选项
    chapterList.value = data.list?.filter((item: any) => item.chapterLevel === 1) || []
  } catch (error) {
    console.error('加载章节列表失败', error)
  }
}

// 选择"节"时的处理
const selectSection = () => {
  formData.value.chapterLevel = 2
  // 如果没有选择课程，提示先选课程
  if (!formData.value.courseId) {
    message.warning('请先选择所属课程')
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number, defaultCourseId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增章节' : '编辑章节'
  formType.value = type
  resetForm()

  // 如果有默认课程ID（从列表页传入）
  if (defaultCourseId) {
    formData.value.courseId = defaultCourseId
    await handleCourseChange(defaultCourseId)
  }

  // 修改时加载数据
  if (id) {
    formLoading.value = true
    try {
      const data = await CourseChapterApi.getCourseChapter(id)
      formData.value = {
        id: data.id,
        courseId: data.courseId,
        parentId: data.parentId || 0,
        chapterName: data.chapterName,
        chapterOrder: data.chapterOrder ?? 0,
        chapterLevel: data.chapterLevel ?? 1,
      }
      // 加载该课程的章列表
      if (data.courseId) {
        await handleCourseChange(data.courseId)
      }
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()

  formLoading.value = true
  try {
    const data = {
      ...formData.value,
      // 如果是"章"，parentId设为0
      parentId: formData.value.chapterLevel === 1 ? 0 : formData.value.parentId,
    } as unknown as CourseChapter

    if (formType.value === 'create') {
      await CourseChapterApi.createCourseChapter(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseChapterApi.updateCourseChapter(data)
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
    courseId: undefined,
    parentId: 0,
    chapterName: undefined,
    chapterOrder: 0,
    chapterLevel: 1,
  }
  chapterList.value = []
  formRef.value?.resetFields()
}
</script>
