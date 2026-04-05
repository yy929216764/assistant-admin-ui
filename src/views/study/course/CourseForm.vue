<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
      </el-form-item>

      <el-form-item label="课程封面" prop="courseCover">
        <UploadImg
          v-model="formData.courseCover"
          :drag="false"
          width="200px"
          height="150px"
          directory="course/cover"
        />
        <div class="form-tip text-gray-400 text-xs mt-1">
          建议尺寸：800x600像素，支持jpg、png格式
        </div>
      </el-form-item>

      <el-form-item label="课程简介" prop="courseIntro">
        <el-input
          v-model="formData.courseIntro"
          type="textarea"
          :rows="3"
          placeholder="请输入课程简介"
        />
      </el-form-item>

      <el-form-item label="学习目标" prop="courseTarget">
        <el-input
          v-model="formData.courseTarget"
          type="textarea"
          :rows="2"
          placeholder="请输入学习目标"
        />
      </el-form-item>

      <el-form-item label="难度等级" prop="difficultyLevel">
        <el-radio-group v-model="formData.difficultyLevel">
          <el-radio :value="1">初级</el-radio>
          <el-radio :value="2">中级</el-radio>
          <el-radio :value="3">高级</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="课程状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="0">草稿</el-radio>
          <el-radio :value="1">已发布</el-radio>
          <el-radio :value="2">已下架</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="知识库" prop="aiKnowledgeId">
        <el-select
          v-model="formData.aiKnowledgeId"
          placeholder="请选择知识库（用于AI问答）"
          clearable
          class="!w-full"
        >
          <el-option
            v-for="item in knowledgeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <div class="form-tip text-gray-400 text-xs mt-1">
          绑定知识库后，课程可使用AI问答功能
        </div>
      </el-form-item>

      <!-- 默认模型隐藏，从配置文件读取 -->
      <el-form-item v-if="false" label="默认模型" prop="defaultModelId">
        <el-input v-model="formData.defaultModelId" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" placeholder="请输入排序" />
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
import { CourseApi, Course } from '@/api/study/course'
import { KnowledgeApi } from '@/api/ai/knowledge/knowledge'
import { UploadImg } from '@/components/UploadFile'

/** 课程 表单 */
defineOptions({ name: 'CourseForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const knowledgeList = ref<any[]>([]) // 知识库列表

// 从环境变量获取默认模型ID
const defaultModelId = import.meta.env.VITE_APP_COURSE_DEFAULT_MODEL_ID || undefined

const formData = ref({
  id: undefined,
  courseName: undefined,
  courseCover: undefined,
  courseIntro: undefined,
  courseTarget: undefined,
  difficultyLevel: 1,
  status: 0,
  teacherId: undefined,
  aiKnowledgeId: undefined,
  defaultModelId: undefined,
  sort: 0,
})

const formRules = reactive({
  courseName: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
  difficultyLevel: [{ required: true, message: '难度等级不能为空', trigger: 'change' }],
  status: [{ required: true, message: '课程状态不能为空', trigger: 'change' }],
})

const formRef = ref() // 表单 Ref

/** 获取知识库列表 */
const getKnowledgeList = async () => {
  try {
    const data = await KnowledgeApi.getKnowledgePage({ pageNo: 1, pageSize: 100 })
    knowledgeList.value = data.list || []
  } catch (error) {
    console.error('获取知识库列表失败', error)
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增课程' : '编辑课程'
  formType.value = type
  resetForm()

  // 加载知识库列表
  await getKnowledgeList()

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await CourseApi.getCourse(id)
      formData.value = {
        id: data.id,
        courseName: data.courseName,
        courseCover: data.courseCover,
        courseIntro: data.courseIntro,
        courseTarget: data.courseTarget,
        difficultyLevel: data.difficultyLevel,
        status: data.status,
        teacherId: data.teacherId,
        aiKnowledgeId: data.aiKnowledgeId,
        defaultModelId: data.defaultModelId,
        sort: data.sort,
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
    const data = { ...formData.value } as unknown as Course
    // 如果没有设置默认模型，使用配置文件中的默认值
    if (!data.defaultModelId && defaultModelId) {
      data.defaultModelId = Number(defaultModelId)
    }
    if (formType.value === 'create') {
      await CourseApi.createCourse(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseApi.updateCourse(data)
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
    courseName: undefined,
    courseCover: undefined,
    courseIntro: undefined,
    courseTarget: undefined,
    difficultyLevel: 1,
    status: 0,
    teacherId: undefined,
    aiKnowledgeId: undefined,
    defaultModelId: undefined,
    sort: 0,
  }
  formRef.value?.resetFields()
}
</script>
