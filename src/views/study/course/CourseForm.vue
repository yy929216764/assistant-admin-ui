<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
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
      <el-form-item label="课程封面URL" prop="courseCover">
        <el-input v-model="formData.courseCover" placeholder="请输入课程封面URL" />
      </el-form-item>
      <el-form-item label="课程简介" prop="courseIntro">
        <el-input v-model="formData.courseIntro" placeholder="请输入课程简介" />
      </el-form-item>
      <el-form-item label="学习目标" prop="courseTarget">
        <el-input v-model="formData.courseTarget" placeholder="请输入学习目标" />
      </el-form-item>
      <el-form-item label="难度等级 1-初级 2-中级 3-高级" prop="difficultyLevel">
        <el-input v-model="formData.difficultyLevel" placeholder="请输入难度等级 1-初级 2-中级 3-高级" />
      </el-form-item>
      <el-form-item label="状态 0-草稿 1-已发布 2-已下架" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="教师用户编号（可空，首版弱化教师角色依赖）" prop="teacherId">
        <el-input v-model="formData.teacherId" placeholder="请输入教师用户编号（可空，首版弱化教师角色依赖）" />
      </el-form-item>
      <el-form-item label="AI知识库编号，对应 ai_knowledge.id" prop="aiKnowledgeId">
        <el-input v-model="formData.aiKnowledgeId" placeholder="请输入AI知识库编号，对应 ai_knowledge.id" />
      </el-form-item>
      <el-form-item label="课程默认问答模型编号，对应 ai_model.id" prop="defaultModelId">
        <el-input v-model="formData.defaultModelId" placeholder="请输入课程默认问答模型编号，对应 ai_model.id" />
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
import { CourseApi, Course } from '@/api/study/course'

/** 课程 表单 */
defineOptions({ name: 'CourseForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  courseName: undefined,
  courseCover: undefined,
  courseIntro: undefined,
  courseTarget: undefined,
  difficultyLevel: undefined,
  status: undefined,
  teacherId: undefined,
  aiKnowledgeId: undefined,
  defaultModelId: undefined,
  sort: undefined,
})
const formRules = reactive({
  courseName: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
  difficultyLevel: [{ required: true, message: '难度等级 1-初级 2-中级 3-高级不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态 0-草稿 1-已发布 2-已下架不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

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
      formData.value = await CourseApi.getCourse(id)
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
    const data = formData.value as unknown as Course
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
    difficultyLevel: undefined,
    status: undefined,
    teacherId: undefined,
    aiKnowledgeId: undefined,
    defaultModelId: undefined,
    sort: undefined,
  }
  formRef.value?.resetFields()
}
</script>