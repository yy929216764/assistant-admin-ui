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
      <el-form-item label="题型 1-单选 2-判断 3-简答" prop="questionType">
        <el-select v-model="formData.questionType" placeholder="请选择题型 1-单选 2-判断 3-简答">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目内容" prop="questionContent">
        <Editor v-model="formData.questionContent" height="150px" />
      </el-form-item>
      <el-form-item label="选项(JSON)" prop="optionsJson">
        <el-input v-model="formData.optionsJson" placeholder="请输入选项(JSON)" />
      </el-form-item>
      <el-form-item label="正确答案" prop="correctAnswer">
        <el-input v-model="formData.correctAnswer" placeholder="请输入正确答案" />
      </el-form-item>
      <el-form-item label="答案解析" prop="analysis">
        <el-input v-model="formData.analysis" placeholder="请输入答案解析" />
      </el-form-item>
      <el-form-item label="关联知识点编号" prop="knowledgePointId">
        <el-input v-model="formData.knowledgePointId" placeholder="请输入关联知识点编号" />
      </el-form-item>
      <el-form-item label="来源类型 1-AI生成 2-预置题" prop="sourceType">
        <el-select v-model="formData.sourceType" placeholder="请选择来源类型 1-AI生成 2-预置题">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否AI生成" prop="aiGenerated">
        <el-radio-group v-model="formData.aiGenerated">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
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
import { ExerciseQuestionApi, ExerciseQuestion } from '@/api/study/exercisequestion'

/** 练习题 表单 */
defineOptions({ name: 'ExerciseQuestionForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  exerciseId: undefined,
  questionType: undefined,
  questionContent: undefined,
  optionsJson: undefined,
  correctAnswer: undefined,
  analysis: undefined,
  knowledgePointId: undefined,
  sourceType: undefined,
  aiGenerated: undefined,
  sort: undefined,
})
const formRules = reactive({
  exerciseId: [{ required: true, message: '练习编号不能为空', trigger: 'blur' }],
  questionType: [{ required: true, message: '题型 1-单选 2-判断 3-简答不能为空', trigger: 'change' }],
  questionContent: [{ required: true, message: '题目内容不能为空', trigger: 'blur' }],
  sourceType: [{ required: true, message: '来源类型 1-AI生成 2-预置题不能为空', trigger: 'change' }],
  aiGenerated: [{ required: true, message: '是否AI生成不能为空', trigger: 'blur' }],
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
      formData.value = await ExerciseQuestionApi.getExerciseQuestion(id)
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
    const data = formData.value as unknown as ExerciseQuestion
    if (formType.value === 'create') {
      await ExerciseQuestionApi.createExerciseQuestion(data)
      message.success(t('common.createSuccess'))
    } else {
      await ExerciseQuestionApi.updateExerciseQuestion(data)
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
    questionType: undefined,
    questionContent: undefined,
    optionsJson: undefined,
    correctAnswer: undefined,
    analysis: undefined,
    knowledgePointId: undefined,
    sourceType: undefined,
    aiGenerated: undefined,
    sort: undefined,
  }
  formRef.value?.resetFields()
}
</script>