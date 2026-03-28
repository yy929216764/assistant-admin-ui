<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="练习名称" prop="exerciseName">
        <el-input v-model="formData.exerciseName" placeholder="请输入练习名称" />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户编号" />
      </el-form-item>
      <el-form-item label="课程编号" prop="courseId">
        <el-input v-model="formData.courseId" placeholder="请输入课程编号" />
      </el-form-item>
      <el-form-item label="章节编号" prop="chapterId">
        <el-input v-model="formData.chapterId" placeholder="请输入章节编号" />
      </el-form-item>
      <el-form-item label="知识点编号" prop="knowledgePointId">
        <el-input v-model="formData.knowledgePointId" placeholder="请输入知识点编号" />
      </el-form-item>
      <el-form-item label="练习类型 1-AI生成 2-固定练习" prop="exerciseType">
        <el-select v-model="formData.exerciseType" placeholder="请选择练习类型 1-AI生成 2-固定练习">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目数量" prop="questionCount">
        <el-input v-model="formData.questionCount" placeholder="请输入题目数量" />
      </el-form-item>
      <el-form-item label="状态 0-未开始 1-进行中 2-已完成" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="得分" prop="score">
        <el-input v-model="formData.score" placeholder="请输入得分" />
      </el-form-item>
      <el-form-item label="正确题数" prop="correctCount">
        <el-input v-model="formData.correctCount" placeholder="请输入正确题数" />
      </el-form-item>
      <el-form-item label="生成题目使用的模型编号，对应 ai_model.id" prop="generateModelId">
        <el-input v-model="formData.generateModelId" placeholder="请输入生成题目使用的模型编号，对应 ai_model.id" />
      </el-form-item>
      <el-form-item label="生成题目使用的AI对话编号，对应 ai_chat_conversation.id" prop="generateConversationId">
        <el-input v-model="formData.generateConversationId" placeholder="请输入生成题目使用的AI对话编号，对应 ai_chat_conversation.id" />
      </el-form-item>
      <el-form-item label="生成题目时的提示词快照" prop="promptSnapshot">
        <el-input v-model="formData.promptSnapshot" placeholder="请输入生成题目时的提示词快照" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          value-format="x"
          placeholder="选择开始时间"
        />
      </el-form-item>
      <el-form-item label="提交时间" prop="submitTime">
        <el-date-picker
          v-model="formData.submitTime"
          type="date"
          value-format="x"
          placeholder="选择提交时间"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ExerciseApi, Exercise } from '@/api/study/exercise'

/** 练习主 表单 */
defineOptions({ name: 'ExerciseForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  exerciseName: undefined,
  userId: undefined,
  courseId: undefined,
  chapterId: undefined,
  knowledgePointId: undefined,
  exerciseType: undefined,
  questionCount: undefined,
  status: undefined,
  score: undefined,
  correctCount: undefined,
  generateModelId: undefined,
  generateConversationId: undefined,
  promptSnapshot: undefined,
  startTime: undefined,
  submitTime: undefined,
})
const formRules = reactive({
  exerciseName: [{ required: true, message: '练习名称不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户编号不能为空', trigger: 'blur' }],
  courseId: [{ required: true, message: '课程编号不能为空', trigger: 'blur' }],
  exerciseType: [{ required: true, message: '练习类型 1-AI生成 2-固定练习不能为空', trigger: 'change' }],
  questionCount: [{ required: true, message: '题目数量不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态 0-未开始 1-进行中 2-已完成不能为空', trigger: 'blur' }],
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
      formData.value = await ExerciseApi.getExercise(id)
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
    const data = formData.value as unknown as Exercise
    if (formType.value === 'create') {
      await ExerciseApi.createExercise(data)
      message.success(t('common.createSuccess'))
    } else {
      await ExerciseApi.updateExercise(data)
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
    exerciseName: undefined,
    userId: undefined,
    courseId: undefined,
    chapterId: undefined,
    knowledgePointId: undefined,
    exerciseType: undefined,
    questionCount: undefined,
    status: undefined,
    score: undefined,
    correctCount: undefined,
    generateModelId: undefined,
    generateConversationId: undefined,
    promptSnapshot: undefined,
    startTime: undefined,
    submitTime: undefined,
  }
  formRef.value?.resetFields()
}
</script>