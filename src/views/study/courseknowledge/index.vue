<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="queryParams.courseId"
          placeholder="请先选择课程"
          clearable
          filterable
          remote
          :remote-method="fetchCourseList"
          :loading="courseLoading"
          class="!w-280px"
          @change="handleCourseChange"
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
      <el-form-item label="知识点" prop="knowledgePointName">
        <el-input
          v-model="queryParams.knowledgePointName"
          placeholder="请输入知识点名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>

        <!-- 新增按钮 - 未选课程时禁用并提示 -->
        <el-tooltip
          :content="queryParams.courseId ? '添加新知识点' : '请先选择课程后再添加知识点'"
          placement="top"
        >
          <el-button
            type="primary"
            plain
            :disabled="!queryParams.courseId"
            @click="openForm('create')"
            v-hasPermi="['study:course-knowledge:create']"
          >
            <Icon icon="ep:plus" class="mr-5px" /> 新增知识点
          </el-button>
        </el-tooltip>

        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:course-knowledge:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 未选择课程提示 -->
    <el-alert
      v-if="!queryParams.courseId"
      title="请先选择课程"
      description="选择课程后，可以查看和管理该课程的知识点"
      type="info"
      :closable="false"
      show-icon
      class="mb-16px"
    />

    <!-- 已选课程提示 -->
    <el-alert
      v-else
      :title="`当前课程：${currentCourseName || '加载中...'}`"
      :description="`共 ${total} 个知识点`"
      type="success"
      :closable="false"
      class="mb-16px"
    />
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      row-key="id"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column label="知识点名称" align="left" prop="knowledgePointName" min-width="250">
        <template #default="scope">
          <div class="flex items-center">
            <Icon icon="ep:lightbulb" class="mr-8px text-yellow-500 text-16px" />
            <span class="font-medium">{{ scope.row.knowledgePointName }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="所属章节" align="left" prop="chapterName" min-width="200">
        <template #default="scope">
          <div v-if="scope.row.chapterName" class="flex items-center text-gray-600">
            <Icon icon="ep:document" class="mr-4px text-green-500" />
            {{ scope.row.chapterName }}
          </div>
          <el-tag v-else type="info" size="small">未关联章节</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="排序" align="center" prop="sort" width="80">
        <template #default="scope">
          <span class="text-gray-500">{{ scope.row.sort }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="160px"
      />

      <el-table-column label="操作" align="center" width="180px" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['study:course-knowledge:update']"
          >
            <Icon icon="ep:edit" class="mr-4px" /> 编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:course-knowledge:delete']"
          >
            <Icon icon="ep:delete" class="mr-4px" /> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 - 已选课程但无数据 -->
    <el-empty
      v-if="!loading && queryParams.courseId && list.length === 0"
      description="该课程暂无知识点"
    >
      <el-button type="primary" @click="openForm('create')">
        <Icon icon="ep:plus" class="mr-5px" /> 添加第一个知识点
      </el-button>
    </el-empty>

    <!-- 分页 -->
    <Pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗 -->
  <CourseKnowledgeForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { CourseKnowledgeApi, CourseKnowledge } from '@/api/study/courseknowledge'
import { CourseApi } from '@/api/study/course'
import CourseKnowledgeForm from './CourseKnowledgeForm.vue'

/** 课程知识点 列表 */
defineOptions({ name: 'CourseKnowledge' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<CourseKnowledge[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  courseId: undefined as number | undefined,
  knowledgePointName: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)
const courseList = ref<any[]>([])
const courseLoading = ref(false)

// 当前选中的课程名称
const currentCourseName = computed(() => {
  const course = courseList.value.find(c => c.id === queryParams.courseId)
  return course?.courseName
})

/** 查询列表 */
const getList = async () => {
  if (!queryParams.courseId) {
    list.value = []
    total.value = 0
    loading.value = false
    return
  }

  loading.value = true
  try {
    const data = await CourseKnowledgeApi.getCourseKnowledgePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 课程选择变化 */
const handleCourseChange = () => {
  queryParams.pageNo = 1
  getList()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  list.value = []
  total.value = 0
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id, queryParams.courseId)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await CourseKnowledgeApi.deleteCourseKnowledge(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 批量删除课程知识点 */
const handleDeleteBatch = async () => {
  try {
    await message.delConfirm()
    await CourseKnowledgeApi.deleteCourseKnowledgeList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: CourseKnowledge[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CourseKnowledgeApi.exportCourseKnowledge(queryParams)
    download.excel(data, '课程知识点.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// 课程下拉搜索
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

/** 初始化 **/
onMounted(() => {
  loading.value = false
})
</script>
