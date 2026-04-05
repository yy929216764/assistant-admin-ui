<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="所属课程" prop="courseId">
        <el-select
          v-model="formData.courseId"
          placeholder="请选择或搜索课程"
          clearable
          filterable
          remote
          :remote-method="fetchCourseList"
          :loading="courseLoading"
          style="width: 100%"
          @change="handleCourseChange"
          @focus="fetchCourseList('')"
        >
          <el-option
            v-for="item in courseList"
            :key="item.id"
            :label="item.courseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属章节" prop="chapterId">
        <el-select
          v-model="formData.chapterId"
          placeholder="请先选择课程"
          clearable
          filterable
          :disabled="!formData.courseId"
          :loading="chapterLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in chapterList"
            :key="item.id"
            :label="item.chapterName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="知识点名称" prop="knowledgePointName">
        <el-input v-model="formData.knowledgePointName" placeholder="请输入知识点名称" />
      </el-form-item>
      <el-form-item label="知识点摘要" prop="knowledgePointSummary">
        <el-input v-model="formData.knowledgePointSummary" placeholder="请输入知识点摘要" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入排序" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { CourseKnowledgeApi, CourseKnowledge } from '@/api/study/courseknowledge'
import { CourseApi } from '@/api/study/course'
import { CourseChapterApi } from '@/api/study/coursechapter'

/** 课程知识点 表单 */
defineOptions({ name: 'CourseKnowledgeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  courseId: undefined,
  chapterId: undefined,
  knowledgePointName: undefined,
  knowledgePointSummary: undefined,
  sort: undefined,
})
const formRules = reactive({
  courseId: [{ required: true, message: '课程编号不能为空', trigger: 'blur' }],
  knowledgePointName: [{ required: true, message: '知识点名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const courseList = ref<any[]>([]) // 课程列表
const chapterList = ref<any[]>([]) // 章节列表
const courseLoading = ref(false)
const chapterLoading = ref(false)

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

// 根据课程加载章节列表
const handleCourseChange = async (courseId: number) => {
  formData.value.chapterId = undefined
  chapterList.value = []
  if (!courseId) return
  chapterLoading.value = true
  try {
    const data = await CourseChapterApi.getCourseChapterPage({
      pageNo: 1,
      pageSize: 100,
      courseId: courseId
    })
    chapterList.value = data.list
  } finally {
    chapterLoading.value = false
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await CourseKnowledgeApi.getCourseKnowledge(id)
      formData.value = data
      // 加载课程和章节信息
      if (data.courseId) {
        await handleCourseChange(data.courseId)
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CourseKnowledge
    if (formType.value === 'create') {
      await CourseKnowledgeApi.createCourseKnowledge(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseKnowledgeApi.updateCourseKnowledge(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
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
    chapterId: undefined,
    knowledgePointName: undefined,
    knowledgePointSummary: undefined,
    sort: undefined,
  }
  formRef.value?.resetFields()
}
</script>