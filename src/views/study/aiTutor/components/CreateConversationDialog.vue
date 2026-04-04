<template>
  <el-dialog
    v-model="visible"
    title="新建学习问答会话"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="选择课程" prop="courseId">
        <el-select
          v-model="form.courseId"
          placeholder="请选择课程"
          class="w-full"
          filterable
        >
          <el-option
            v-for="course in courseList"
            :key="course.id"
            :label="course.courseName"
            :value="course.id"
          />
        </el-select>
        <div class="text-12px text-gray-400 mt-4px">
          选择课程后，AI将基于该课程的知识库回答您的问题
        </div>
      </el-form-item>

      <el-form-item label="会话标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入会话标题（可选）"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="场景类型" prop="sceneType">
        <el-radio-group v-model="form.sceneType">
          <el-radio :label="1">课程问答</el-radio>
          <el-radio :label="2">错题分析</el-radio>
          <el-radio :label="3">练习生成</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="isLoading" @click="handleSubmit">
        创建
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { StudyAiTutorApi } from '@/api/study/aiTutor'

interface Props {
  visible: boolean
  courseList: any[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:visible', 'success'])

const formRef = ref<FormInstance>()
const isLoading = ref(false)
const visible = ref(props.visible)

const form = reactive({
  courseId: undefined as number | undefined,
  title: '',
  sceneType: 1
})

const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  sceneType: [{ required: true, message: '请选择场景类型', trigger: 'change' }]
}

watch(() => props.visible, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:visible', val)
  if (!val) {
    resetForm()
  }
})

const resetForm = () => {
  form.courseId = undefined
  form.title = ''
  form.sceneType = 1
  formRef.value?.resetFields()
}

const handleClose = () => {
  visible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    isLoading.value = true
    try {
      const res = await StudyAiTutorApi.createConversation({
        courseId: form.courseId!,
        title: form.title || undefined,
        sceneType: form.sceneType
      })
      ElMessage.success('创建成功')
      emit('success', res)
      handleClose()
    } catch (error) {
      console.error('创建会话失败', error)
    } finally {
      isLoading.value = false
    }
  })
}
</script>
