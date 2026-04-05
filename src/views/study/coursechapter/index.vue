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
      <el-form-item label="章节名称" prop="chapterName">
        <el-input
          v-model="queryParams.chapterName"
          placeholder="请输入章节名称"
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
          :content="queryParams.courseId ? '添加新章节' : '请先选择课程后再添加章节'"
          placement="top"
        >
          <el-button
            type="primary"
            plain
            :disabled="!queryParams.courseId"
            @click="openForm('create')"
            v-hasPermi="['study:course-chapter:create']"
          >
            <Icon icon="ep:plus" class="mr-5px" /> 新增章节
          </el-button>
        </el-tooltip>

        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:course-chapter:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 未选择课程提示 -->
    <el-alert
      v-if="!queryParams.courseId"
      title="请先选择课程"
      description="选择课程后，可以查看和管理该课程的章节结构（章/节）"
      type="info"
      :closable="false"
      show-icon
      class="mb-16px"
    />
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <!-- 章节结构说明 -->
    <div v-if="queryParams.courseId" class="flex items-center gap-16px mb-16px">
      <div class="flex items-center text-14px text-gray-600">
        <Icon icon="ep:folder-opened" class="mr-8px text-blue-500" />
        <span>章（一级）</span>
      </div>
      <div class="flex items-center text-14px text-gray-600">
        <Icon icon="ep:document" class="mr-8px text-green-500 ml-24px" />
        <span>节（二级）</span>
      </div>
      <div class="text-12px text-gray-400 ml-auto">
        共 {{ total }} 个章节
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      default-expand-all
    >
      <el-table-column label="章节名称" align="left" prop="chapterName" min-width="300">
        <template #default="scope">
          <div class="flex items-center">
            <!-- 章图标 -->
            <Icon
              v-if="scope.row.chapterLevel === 1"
              icon="ep:folder-opened"
              class="mr-8px text-blue-500 text-18px"
            />
            <!-- 节图标 -->
            <Icon
              v-else
              icon="ep:document"
              class="mr-8px text-green-500 text-16px ml-24px"
            />
            <span :class="scope.row.chapterLevel === 1 ? 'font-medium' : ''">
              {{ scope.row.chapterName }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="章节类型" align="center" prop="chapterLevel" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.chapterLevel === 1" type="primary" size="small">章</el-tag>
          <el-tag v-else type="success" size="small">节</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="排序" align="center" prop="chapterOrder" width="80">
        <template #default="scope">
          <span class="text-gray-500">{{ scope.row.chapterOrder }}</span>
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
            v-hasPermi="['study:course-chapter:update']"
          >
            <Icon icon="ep:edit" class="mr-4px" /> 编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:course-chapter:delete']"
          >
            <Icon icon="ep:delete" class="mr-4px" /> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 - 已选课程但无数据 -->
    <el-empty
      v-if="!loading && queryParams.courseId && list.length === 0"
      description="该课程暂无章节"
    >
      <el-button type="primary" @click="openForm('create')">
        <Icon icon="ep:plus" class="mr-5px" /> 添加第一个章节
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
  <CourseChapterForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { CourseChapterApi, CourseChapter } from '@/api/study/coursechapter'
import { CourseApi } from '@/api/study/course'
import CourseChapterForm from './CourseChapterForm.vue'

/** 课程章节 列表 */
defineOptions({ name: 'CourseChapter' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<CourseChapter[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100, // 增大每页数量，方便查看完整结构
  courseId: undefined as number | undefined,
  chapterName: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)
const courseList = ref<any[]>([])
const courseLoading = ref(false)

// 加载列表数据
const getList = async () => {
  if (!queryParams.courseId) {
    list.value = []
    total.value = 0
    loading.value = false
    return
  }

  loading.value = true
  try {
    const data = await CourseChapterApi.getCourseChapterPage(queryParams)
    // 处理数据为树形结构
    list.value = buildTree(data.list || [])
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 构建树形结构
const buildTree = (list: any[]): any[] => {
  // 按层级和排序排序
  const sorted = [...list].sort((a, b) => {
    if (a.chapterLevel !== b.chapterLevel) {
      return a.chapterLevel - b.chapterLevel // 章在前，节在后
    }
    return (a.chapterOrder || 0) - (b.chapterOrder || 0)
  })

  const chapters: any[] = []
  const chapterMap: Record<number, any> = {}

  // 第一遍：找出所有章
  sorted.forEach((item) => {
    if (item.chapterLevel === 1) {
      const chapter = { ...item, children: [] }
      chapters.push(chapter)
      chapterMap[item.id] = chapter
    }
  })

  // 第二遍：将节放入对应的章
  sorted.forEach((item) => {
    if (item.chapterLevel === 2 && item.parentId && chapterMap[item.parentId]) {
      chapterMap[item.parentId].children.push(item)
    } else if (item.chapterLevel === 2) {
      // 如果父章节不存在，作为独立节点
      chapters.push(item)
    }
  })

  return chapters
}

// 课程选择变化
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
    await CourseChapterApi.deleteCourseChapter(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CourseChapterApi.exportCourseChapter(queryParams)
    download.excel(data, '课程章节.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

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

/** 初始化 **/
onMounted(() => {
  // 页面加载时不自动查询，等待用户选择课程
  loading.value = false
})
</script>
