<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="资料名称" prop="materialName">
        <el-input v-model="formData.materialName" placeholder="请输入资料名称" />
      </el-form-item>

      <el-form-item label="资料类型" prop="materialType">
        <el-select v-model="formData.materialType" placeholder="请选择资料类型" class="!w-full">
          <el-option label="PDF" :value="1" />
          <el-option label="Word" :value="2" />
          <el-option label="Markdown" :value="3" />
          <el-option label="文本" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="关联课程" prop="courseId">
        <el-select
          v-model="formData.courseId"
          placeholder="请选择关联课程"
          clearable
          class="!w-full"
          @change="handleCourseChange"
        >
          <el-option
            v-for="item in courseList"
            :key="item.id"
            :label="item.courseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="AI问答">
        <div v-if="courseInfo?.aiEnabled" class="flex items-center text-green-600 text-sm">
          <Icon icon="ep:check" class="mr-1" />
          已关联课程知识库，资料将自动用于AI问答
        </div>
        <div v-else class="flex items-center text-gray-400 text-sm">
          <Icon icon="ep:info-filled" class="mr-1" />
          当前课程未启用AI功能，资料仅做存储
        </div>
      </el-form-item>

      <el-form-item label="资料文件" prop="fileUrl">
        <UploadFile
          v-model="formData.fileUrl"
          :limit="1"
          :file-size="100"
          :file-type="['pdf', 'doc', 'docx', 'txt', 'md']"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" :loading="formLoading">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { MaterialApi, Material } from '@/api/study/material'
import { CourseApi } from '@/api/study/course'
import { Icon } from '@/components/Icon'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'

/** 学习资料 表单 */
defineOptions({ name: 'MaterialForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const courseList = ref<any[]>([]) // 课程列表
const courseInfo = ref<any>(null) // 当前选中的课程信息

const formData = ref({
  id: undefined,
  materialName: undefined,
  materialType: undefined,
  fileUrl: undefined,
  fileSize: undefined,
  courseId: undefined,
  chapterId: undefined,
  knowledgePointId: undefined,
  aiKnowledgeId: undefined,
})

const formRules = reactive({
  materialName: [{ required: true, message: '资料名称不能为空', trigger: 'blur' }],
  materialType: [{ required: true, message: '资料类型不能为空', trigger: 'change' }],
  fileUrl: [{ required: true, message: '请上传资料文件', trigger: 'change' }],
})

const formRef = ref() // 表单 Ref

/** 获取课程列表 */
const getCourseList = async () => {
  try {
    const data = await CourseApi.getCoursePage({ pageNo: 1, pageSize: 100 })
    courseList.value = data.list || []
  } catch (error) {
    console.error('获取课程列表失败', error)
  }
}

/** 课程选择变化 */
const handleCourseChange = async (courseId: number) => {
  if (!courseId) {
    courseInfo.value = null
    return
  }
  // 获取课程详情，检查是否启用AI
  try {
    courseInfo.value = await CourseApi.getCourse(courseId)
    // 自动填充知识库ID（如果课程已启用AI）
    if (courseInfo.value.aiEnabled && courseInfo.value.aiKnowledgeId) {
      formData.value.aiKnowledgeId = courseInfo.value.aiKnowledgeId
    } else {
      formData.value.aiKnowledgeId = undefined
    }
  } catch (error) {
    console.error('获取课程信息失败', error)
    courseInfo.value = null
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增资料' : '编辑资料'
  formType.value = type
  resetForm()

  // 加载课程列表
  await getCourseList()

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await MaterialApi.getMaterial(id)
      formData.value = {
        id: data.id,
        materialName: data.materialName,
        materialType: data.materialType,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        courseId: data.courseId,
        chapterId: data.chapterId,
        knowledgePointId: data.knowledgePointId,
        aiKnowledgeId: data.aiKnowledgeId,
      }
      // 加载课程信息
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
    const data = formData.value as unknown as Material
    if (formType.value === 'create') {
      await MaterialApi.createMaterial(data)
      message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.updateMaterial(data)
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
    materialName: undefined,
    materialType: undefined,
    fileUrl: undefined,
    fileSize: undefined,
    courseId: undefined,
    chapterId: undefined,
    knowledgePointId: undefined,
    aiKnowledgeId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
