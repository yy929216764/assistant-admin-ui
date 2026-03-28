<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
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
      <el-form-item label="资料类型 1-PDF 2-Word 3-Markdown 4-文本 5-视频 6-其他" prop="materialType">
        <el-select v-model="formData.materialType" placeholder="请选择资料类型 1-PDF 2-Word 3-Markdown 4-文本 5-视频 6-其他">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="文件URL" prop="fileUrl">
        <el-input v-model="formData.fileUrl" placeholder="请输入文件URL" />
      </el-form-item>
      <el-form-item label="文件大小(字节)" prop="fileSize">
        <el-input v-model="formData.fileSize" placeholder="请输入文件大小(字节)" />
      </el-form-item>
      <el-form-item label="关联课程编号" prop="courseId">
        <el-input v-model="formData.courseId" placeholder="请输入关联课程编号" />
      </el-form-item>
      <el-form-item label="关联章节编号" prop="chapterId">
        <el-input v-model="formData.chapterId" placeholder="请输入关联章节编号" />
      </el-form-item>
      <el-form-item label="关联知识点编号" prop="knowledgePointId">
        <el-input v-model="formData.knowledgePointId" placeholder="请输入关联知识点编号" />
      </el-form-item>
      <el-form-item label="目标AI知识库编号，对应 ai_knowledge.id" prop="aiKnowledgeId">
        <el-input v-model="formData.aiKnowledgeId" placeholder="请输入目标AI知识库编号，对应 ai_knowledge.id" />
      </el-form-item>
      <el-form-item label="AI知识库文档编号，对应 ai_knowledge_document.id" prop="aiDocumentId">
        <el-input v-model="formData.aiDocumentId" placeholder="请输入AI知识库文档编号，对应 ai_knowledge_document.id" />
      </el-form-item>
      <el-form-item label="知识库同步状态 0-待同步 1-同步中 2-成功 3-失败" prop="syncStatus">
        <el-radio-group v-model="formData.syncStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="同步失败原因" prop="syncErrorMsg">
        <el-input v-model="formData.syncErrorMsg" placeholder="请输入同步失败原因" />
      </el-form-item>
      <el-form-item label="最近同步时间" prop="syncTime">
        <el-date-picker
          v-model="formData.syncTime"
          type="date"
          value-format="x"
          placeholder="选择最近同步时间"
        />
      </el-form-item>
      <el-form-item label="上传用户编号" prop="uploadUserId">
        <el-input v-model="formData.uploadUserId" placeholder="请输入上传用户编号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { MaterialApi, Material } from '@/api/study/material'

/** 学习资料 表单 */
defineOptions({ name: 'MaterialForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
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
  aiDocumentId: undefined,
  syncStatus: undefined,
  syncErrorMsg: undefined,
  syncTime: undefined,
  uploadUserId: undefined,
})
const formRules = reactive({
  materialName: [{ required: true, message: '资料名称不能为空', trigger: 'blur' }],
  materialType: [{ required: true, message: '资料类型 1-PDF 2-Word 3-Markdown 4-文本 5-视频 6-其他不能为空', trigger: 'change' }],
  fileUrl: [{ required: true, message: '文件URL不能为空', trigger: 'blur' }],
  syncStatus: [{ required: true, message: '知识库同步状态 0-待同步 1-同步中 2-成功 3-失败不能为空', trigger: 'blur' }],
  uploadUserId: [{ required: true, message: '上传用户编号不能为空', trigger: 'blur' }],
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
      formData.value = await MaterialApi.getMaterial(id)
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
    aiDocumentId: undefined,
    syncStatus: undefined,
    syncErrorMsg: undefined,
    syncTime: undefined,
    uploadUserId: undefined,
  }
  formRef.value?.resetFields()
}
</script>