<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户编号" />
      </el-form-item>
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
      <el-form-item label="知识点编号" prop="knowledgePointId">
        <el-input v-model="formData.knowledgePointId" placeholder="请输入知识点编号" />
      </el-form-item>
      <el-form-item label="题目编号" prop="questionId">
        <el-input v-model="formData.questionId" placeholder="请输入题目编号" />
      </el-form-item>
      <el-form-item label="练习编号" prop="exerciseId">
        <el-input v-model="formData.exerciseId" placeholder="请输入练习编号" />
      </el-form-item>
      <el-form-item label="题型 1-单选 2-判断 3-简答" prop="questionType">
        <el-select v-model="formData.questionType" placeholder="请选择题型 1-单选 2-判断 3-简答">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目内容快照" prop="questionContent">
        <Editor v-model="formData.questionContent" height="150px" />
      </el-form-item>
      <el-form-item label="题目选项快照(JSON)" prop="optionsJson">
        <el-input v-model="formData.optionsJson" placeholder="请输入题目选项快照(JSON)" />
      </el-form-item>
      <el-form-item label="正确答案快照" prop="correctAnswer">
        <el-input v-model="formData.correctAnswer" placeholder="请输入正确答案快照" />
      </el-form-item>
      <el-form-item label="题目解析快照" prop="questionAnalysis">
        <el-input v-model="formData.questionAnalysis" placeholder="请输入题目解析快照" />
      </el-form-item>
      <el-form-item label="当时作答答案" prop="userAnswer">
        <el-input v-model="formData.userAnswer" placeholder="请输入当时作答答案" />
      </el-form-item>
      <el-form-item label="错误次数" prop="wrongCount">
        <el-input v-model="formData.wrongCount" placeholder="请输入错误次数" />
      </el-form-item>
      <el-form-item label="掌握状态 0-未掌握 1-已掌握" prop="masterStatus">
        <el-radio-group v-model="formData.masterStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="AI错因分析结果" prop="aiAnalysis">
        <el-input v-model="formData.aiAnalysis" placeholder="请输入AI错因分析结果" />
      </el-form-item>
      <el-form-item label="复习建议" prop="reviewSuggestion">
        <el-input v-model="formData.reviewSuggestion" placeholder="请输入复习建议" />
      </el-form-item>
      <el-form-item label="分析使用模型编号，对应 ai_model.id" prop="analysisModelId">
        <el-input v-model="formData.analysisModelId" placeholder="请输入分析使用模型编号，对应 ai_model.id" />
      </el-form-item>
      <el-form-item label="分析使用AI对话编号，对应 ai_chat_conversation.id" prop="analysisConversationId">
        <el-input v-model="formData.analysisConversationId" placeholder="请输入分析使用AI对话编号，对应 ai_chat_conversation.id" />
      </el-form-item>
      <el-form-item label="分析结果消息编号，对应 ai_chat_message.id" prop="analysisMessageId">
        <el-input v-model="formData.analysisMessageId" placeholder="请输入分析结果消息编号，对应 ai_chat_message.id" />
      </el-form-item>
      <el-form-item label="最后错误时间" prop="lastWrongTime">
        <el-date-picker
          v-model="formData.lastWrongTime"
          type="date"
          value-format="x"
          placeholder="选择最后错误时间"
        />
      </el-form-item>
      <el-form-item label="掌握时间" prop="masterTime">
        <el-date-picker
          v-model="formData.masterTime"
          type="date"
          value-format="x"
          placeholder="选择掌握时间"
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
import { WrongBookApi, WrongBook } from '@/api/study/wrongbook'
import { CourseApi } from '@/api/study/course'

/** 错题本 表单 */
defineOptions({ name: 'WrongBookForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  courseId: undefined,
  knowledgePointId: undefined,
  questionId: undefined,
  exerciseId: undefined,
  questionType: undefined,
  questionContent: undefined,
  optionsJson: undefined,
  correctAnswer: undefined,
  questionAnalysis: undefined,
  userAnswer: undefined,
  wrongCount: undefined,
  masterStatus: undefined,
  aiAnalysis: undefined,
  reviewSuggestion: undefined,
  analysisModelId: undefined,
  analysisConversationId: undefined,
  analysisMessageId: undefined,
  lastWrongTime: undefined,
  masterTime: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '用户编号不能为空', trigger: 'blur' }],
  courseId: [{ required: true, message: '课程编号不能为空', trigger: 'blur' }],
  questionId: [{ required: true, message: '题目编号不能为空', trigger: 'blur' }],
  exerciseId: [{ required: true, message: '练习编号不能为空', trigger: 'blur' }],
  wrongCount: [{ required: true, message: '错误次数不能为空', trigger: 'blur' }],
  masterStatus: [{ required: true, message: '掌握状态 0-未掌握 1-已掌握不能为空', trigger: 'blur' }],
  lastWrongTime: [{ required: true, message: '最后错误时间不能为空', trigger: 'blur' }],
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
      formData.value = await WrongBookApi.getWrongBook(id)
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
    const data = formData.value as unknown as WrongBook
    if (formType.value === 'create') {
      await WrongBookApi.createWrongBook(data)
      message.success(t('common.createSuccess'))
    } else {
      await WrongBookApi.updateWrongBook(data)
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
    userId: undefined,
    courseId: undefined,
    knowledgePointId: undefined,
    questionId: undefined,
    exerciseId: undefined,
    questionType: undefined,
    questionContent: undefined,
    optionsJson: undefined,
    correctAnswer: undefined,
    questionAnalysis: undefined,
    userAnswer: undefined,
    wrongCount: undefined,
    masterStatus: undefined,
    aiAnalysis: undefined,
    reviewSuggestion: undefined,
    analysisModelId: undefined,
    analysisConversationId: undefined,
    analysisMessageId: undefined,
    lastWrongTime: undefined,
    masterTime: undefined,
  }
  formRef.value?.resetFields()
}
</script>