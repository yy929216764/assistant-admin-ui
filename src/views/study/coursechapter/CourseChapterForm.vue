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
      <el-form-item label="父章节编号，0-顶级" prop="parentId">
        <el-input v-model="formData.parentId" placeholder="请输入父章节编号，0-顶级" />
      </el-form-item>
      <el-form-item label="章节名称" prop="chapterName">
        <el-input v-model="formData.chapterName" placeholder="请输入章节名称" />
      </el-form-item>
      <el-form-item label="章节排序" prop="chapterOrder">
        <el-input v-model="formData.chapterOrder" placeholder="请输入章节排序" />
      </el-form-item>
      <el-form-item label="章节层级 1-章 2-节" prop="chapterLevel">
        <el-input v-model="formData.chapterLevel" placeholder="请输入章节层级 1-章 2-节" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { CourseChapterApi, CourseChapter } from '@/api/study/coursechapter'
import { CourseApi } from '@/api/study/course'

/** 课程章节 表单 */
defineOptions({ name: 'CourseChapterForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  courseId: undefined,
  parentId: undefined,
  chapterName: undefined,
  chapterOrder: undefined,
  chapterLevel: undefined,
})
const formRules = reactive({
  courseId: [{ required: true, message: '课程编号不能为空', trigger: 'blur' }],
  parentId: [{ required: true, message: '父章节编号，0-顶级不能为空', trigger: 'blur' }],
  chapterName: [{ required: true, message: '章节名称不能为空', trigger: 'blur' }],
  chapterOrder: [{ required: true, message: '章节排序不能为空', trigger: 'blur' }],
  chapterLevel: [{ required: true, message: '章节层级 1-章 2-节不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const courseList = ref<any[]>([]) // 课程列表
const courseLoading = ref(false)

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
      formData.value = await CourseChapterApi.getCourseChapter(id)
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
    const data = formData.value as unknown as CourseChapter
    if (formType.value === 'create') {
      await CourseChapterApi.createCourseChapter(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseChapterApi.updateCourseChapter(data)
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
    parentId: undefined,
    chapterName: undefined,
    chapterOrder: undefined,
    chapterLevel: undefined,
  }
  formRef.value?.resetFields()
}
</script>