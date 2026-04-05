<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="560px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 所属课程 -->
      <el-form-item label="所属课程" prop="courseId">
        <el-select
          v-model="formData.courseId"
          placeholder="请选择课程"
          clearable
          filterable
          remote
          :remote-method="fetchCourseList"
          :loading="courseLoading"
          class="w-full"
          @focus="fetchCourseList('')"
          @change="handleCourseChange"
        >
          <el-option
            v-for="item in courseList"
            :key="item.id"
            :label="item.courseName"
            :value="item.id"
          />
        </el-select>
        <div class="text-12px text-gray-400 mt-4px">
          选择课程后，可关联该课程的章节
        </div>
      </el-form-item>

      <!-- 所属章节 - 只能选择二级章节（节） -->
      <el-form-item label="所属节" prop="chapterId">
        <el-select
          v-model="formData.chapterId"
          placeholder="请选择所属节（可选）"
          clearable
          filterable
          class="w-full"
          :disabled="!formData.courseId || availableSections.length === 0"
          :loading="chapterLoading"
        >
          <!-- 按章分组的节 -->
          <el-option-group
            v-for="group in sectionGroups"
            :key="group.chapterId"
            :label="group.chapterName"
          >
            <el-option
              v-for="section in group.sections"
              :key="section.id"
              :label="section.chapterName"
              :value="section.id"
            />
          </el-option-group>

          <!-- 未分组的节（直接挂在课程下） -->
          <el-option-group
            v-if="ungroupedSections.length > 0"
            key="ungrouped"
            label="📂 其他"
          >
            <el-option
              v-for="section in ungroupedSections"
              :key="section.id"
              :label="section.chapterName"
              :value="section.id"
            />
          </el-option-group>
        </el-select>

        <!-- 提示信息 -->
        <div v-if="!formData.courseId" class="text-12px text-orange-400 mt-4px">
          <Icon icon="ep:warning" class="mr-4px" />
          请先选择所属课程
        </div>
        <div v-else-if="availableSections.length === 0" class="text-12px text-orange-400 mt-4px">
          <Icon icon="ep:warning" class="mr-4px" />
          该课程暂无节（二级章节），请先创建章节
        </div>
        <div v-else class="text-12px text-gray-400 mt-4px">
          <Icon icon="ep:info-filled" class="mr-4px" />
          知识点只能关联到二级章节（节），不能关联到章
        </div>
      </el-form-item>

      <!-- 知识点名称 -->
      <el-form-item label="知识点名称" prop="knowledgePointName">
        <el-input
          v-model="formData.knowledgePointName"
          placeholder="请输入知识点名称"
          maxlength="100"
          show-word-limit
        />
        <div class="text-12px text-gray-400 mt-4px">
          建议用简洁的名词或短语，如：面向对象三大特性、Java内存模型
        </div>
      </el-form-item>

      <!-- 知识点摘要 - 改为textarea -->
      <el-form-item label="知识点摘要" prop="knowledgePointSummary">
        <el-input
          v-model="formData.knowledgePointSummary"
          type="textarea"
          :rows="3"
          placeholder="请输入知识点摘要（可选）"
          maxlength="500"
          show-word-limit
        />
        <div class="text-12px text-gray-400 mt-4px">
          简要描述该知识点的核心内容，用于AI问答时的上下文参考
        </div>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          placeholder="数字越小越靠前"
          class="w-full"
        />
        <div class="text-12px text-gray-400 mt-4px">
          数字越小排序越靠前，建议按知识点逻辑顺序填写
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="formLoading" @click="submitForm">
        确 定
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { CourseKnowledgeApi, CourseKnowledge } from '@/api/study/courseknowledge'
import { CourseApi } from '@/api/study/course'
import { CourseChapterApi } from '@/api/study/coursechapter'
import { Icon } from '@/components/Icon'

/** 课程知识点 表单 */
defineOptions({ name: 'CourseKnowledgeForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('') // create - 新增；update - 修改

// 表单数据
const formData = ref({
  id: undefined,
  courseId: undefined,
  chapterId: undefined,
  knowledgePointName: undefined,
  knowledgePointSummary: undefined,
  sort: 0,
})

// 表单校验规则
const formRules = reactive({
  courseId: [{ required: true, message: '请选择所属课程', trigger: 'change' }],
  knowledgePointName: [{ required: true, message: '请输入知识点名称', trigger: 'blur' }],
})

const formRef = ref()
const courseList = ref<any[]>([])
const chapterList = ref<any[]>([])
const courseLoading = ref(false)
const chapterLoading = ref(false)

// 计算属性：所有可用的节（二级章节）
const availableSections = computed(() => {
  return chapterList.value.filter((item) => item.chapterLevel === 2);
});

// 计算属性：未分组的节（直接挂在课程下，没有父章节的节）
const ungroupedSections = computed(() => {
  return chapterList.value.filter(
    (item) =>
      item.chapterLevel === 2 && (!item.parentId || item.parentId === 0)
  );
});

// 计算属性：按章分组的节（只显示节，章作为分组标题）
const sectionGroups = computed(() => {
  const groups: any[] = [];
  const chapterMap: Record<number, any> = {};

  // 找出所有章作为分组
  chapterList.value.forEach((item) => {
    if (item.chapterLevel === 1) {
      const group = {
        chapterId: item.id,
        chapterName: `📁 ${item.chapterName}`,
        sections: [],
      };
      groups.push(group);
      chapterMap[item.id] = group;
    }
  });

  // 将节放入对应的章分组
  chapterList.value.forEach((item) => {
    if (
      item.chapterLevel === 2 &&
      item.parentId &&
      chapterMap[item.parentId]
    ) {
      chapterMap[item.parentId].sections.push(item);
    }
  });

  // 只返回有节的分组
  return groups.filter((g) => g.sections.length > 0);
});

// 搜索课程列表
const fetchCourseList = async (query: string) => {
  courseLoading.value = true
  try {
    const data = await CourseApi.getCoursePage({
      pageNo: 1,
      pageSize: 20,
      courseName: query,
    })
    courseList.value = data.list
  } finally {
    courseLoading.value = false
  }
}

// 课程选择变化
const handleCourseChange = async (courseId: number) => {
  formData.value.chapterId = undefined
  chapterList.value = []

  if (!courseId) return

  chapterLoading.value = true
  try {
    const data = await CourseChapterApi.getCourseChapterPage({
      pageNo: 1,
      pageSize: 100,
      courseId: courseId,
    })
    chapterList.value = data.list || []
  } finally {
    chapterLoading.value = false
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number, defaultCourseId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增知识点' : '编辑知识点'
  formType.value = type
  resetForm()

  // 如果有默认课程ID
  if (defaultCourseId) {
    formData.value.courseId = defaultCourseId
    await handleCourseChange(defaultCourseId)
  }

  // 修改时加载数据
  if (id) {
    formLoading.value = true
    try {
      const data = await CourseKnowledgeApi.getCourseKnowledge(id)
      formData.value = {
        id: data.id,
        courseId: data.courseId,
        chapterId: data.chapterId,
        knowledgePointName: data.knowledgePointName,
        knowledgePointSummary: data.knowledgePointSummary,
        sort: data.sort ?? 0,
      }
      // 加载课程和章节信息
      if (data.courseId) {
        await handleCourseChange(data.courseId)
      }
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()

  formLoading.value = true
  try {
    const data = formData.value as unknown as CourseKnowledge
    if (formType.value === 'create') {
      await CourseKnowledgeApi.createCourseKnowledge(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseKnowledgeApi.updateCourseKnowledge(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    courseId: undefined,
    chapterId: undefined,
    knowledgePointName: undefined,
    knowledgePointSummary: undefined,
    sort: 0,
  }
  chapterList.value = []
  formRef.value?.resetFields()
}
</script>
