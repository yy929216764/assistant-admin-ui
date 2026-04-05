<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="AI对话编号，对应 ai_chat_conversation.id" prop="conversationId">
        <el-input v-model="formData.conversationId" placeholder="请输入AI对话编号，对应 ai_chat_conversation.id" />
      </el-form-item>
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
      <el-form-item label="章节编号" prop="chapterId">
        <el-input v-model="formData.chapterId" placeholder="请输入章节编号" />
      </el-form-item>
      <el-form-item label="知识点编号" prop="knowledgePointId">
        <el-input v-model="formData.knowledgePointId" placeholder="请输入知识点编号" />
      </el-form-item>
      <el-form-item label="知识库编号，对应 ai_knowledge.id" prop="aiKnowledgeId">
        <el-input v-model="formData.aiKnowledgeId" placeholder="请输入知识库编号，对应 ai_knowledge.id" />
      </el-form-item>
      <el-form-item label="场景类型 1-课程问答 2-错题分析 3-练习生成" prop="sceneType">
        <el-select v-model="formData.sceneType" placeholder="请选择场景类型 1-课程问答 2-错题分析 3-练习生成">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务编号，按场景存放错题编号或练习编号等" prop="bizId">
        <el-input v-model="formData.bizId" placeholder="请输入业务编号，按场景存放错题编号或练习编号等" />
      </el-form-item>
      <el-form-item label="状态 0-关闭 1-有效" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AiConversationRefApi, AiConversationRef } from '@/api/study/aiconversationref'
import { CourseApi } from '@/api/study/course'

/** 学习场景与AI对话映射 表单 */
defineOptions({ name: 'AiConversationRefForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  conversationId: undefined,
  userId: undefined,
  courseId: undefined,
  chapterId: undefined,
  knowledgePointId: undefined,
  aiKnowledgeId: undefined,
  sceneType: undefined,
  bizId: undefined,
  status: undefined,
})
const formRules = reactive({
  conversationId: [{ required: true, message: 'AI对话编号，对应 ai_chat_conversation.id不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户编号不能为空', trigger: 'blur' }],
  sceneType: [{ required: true, message: '场景类型 1-课程问答 2-错题分析 3-练习生成不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态 0-关闭 1-有效不能为空', trigger: 'blur' }],
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
      formData.value = await AiConversationRefApi.getAiConversationRef(id)
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
    const data = formData.value as unknown as AiConversationRef
    if (formType.value === 'create') {
      await AiConversationRefApi.createAiConversationRef(data)
      message.success(t('common.createSuccess'))
    } else {
      await AiConversationRefApi.updateAiConversationRef(data)
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
    conversationId: undefined,
    userId: undefined,
    courseId: undefined,
    chapterId: undefined,
    knowledgePointId: undefined,
    aiKnowledgeId: undefined,
    sceneType: undefined,
    bizId: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}
</script>