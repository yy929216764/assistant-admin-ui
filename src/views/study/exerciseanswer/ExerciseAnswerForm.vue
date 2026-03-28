<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="练习编号" prop="exerciseId">
        <el-input v-model="formData.exerciseId" placeholder="请输入练习编号" />
      </el-form-item>
      <el-form-item label="题目编号" prop="questionId">
        <el-input v-model="formData.questionId" placeholder="请输入题目编号" />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户编号" />
      </el-form-item>
      <el-form-item label="用户答案" prop="userAnswer">
        <el-input v-model="formData.userAnswer" placeholder="请输入用户答案" />
      </el-form-item>
      <el-form-item label="是否正确" prop="isCorrect">
        <el-radio-group v-model="formData.isCorrect">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="得分" prop="score">
        <el-input v-model="formData.score" placeholder="请输入得分" />
      </el-form-item>
      <el-form-item label="AI评价(简答题预留)" prop="aiEvaluation">
        <el-input v-model="formData.aiEvaluation" placeholder="请输入AI评价(简答题预留)" />
      </el-form-item>
      <el-form-item label="答题耗时(毫秒)" prop="answerTimeMs">
        <el-input v-model="formData.answerTimeMs" placeholder="请输入答题耗时(毫秒)" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ExerciseAnswerApi, ExerciseAnswer } from '@/api/study/exerciseanswer'

/** 用户答题 表单 */
defineOptions({ name: 'ExerciseAnswerForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  exerciseId: undefined,
  questionId: undefined,
  userId: undefined,
  userAnswer: undefined,
  isCorrect: undefined,
  score: undefined,
  aiEvaluation: undefined,
  answerTimeMs: undefined,
})
const formRules = reactive({
  exerciseId: [{ required: true, message: '练习编号不能为空', trigger: 'blur' }],
  questionId: [{ required: true, message: '题目编号不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户编号不能为空', trigger: 'blur' }],
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
      formData.value = await ExerciseAnswerApi.getExerciseAnswer(id)
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
    const data = formData.value as unknown as ExerciseAnswer
    if (formType.value === 'create') {
      await ExerciseAnswerApi.createExerciseAnswer(data)
      message.success(t('common.createSuccess'))
    } else {
      await ExerciseAnswerApi.updateExerciseAnswer(data)
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
    exerciseId: undefined,
    questionId: undefined,
    userId: undefined,
    userAnswer: undefined,
    isCorrect: undefined,
    score: undefined,
    aiEvaluation: undefined,
    answerTimeMs: undefined,
  }
  formRef.value?.resetFields()
}
</script>