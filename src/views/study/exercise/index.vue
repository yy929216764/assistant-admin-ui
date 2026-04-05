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
      <el-form-item label="练习名称" prop="exerciseName">
        <el-input
          v-model="queryParams.exerciseName"
          placeholder="请输入练习名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="queryParams.courseId"
          placeholder="请选择课程"
          clearable
          filterable
          remote
          :remote-method="fetchCourseList"
          :loading="courseLoading"
          class="!w-200px"
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
      <el-form-item label="类型" prop="exerciseType">
        <el-select
          v-model="queryParams.exerciseType"
          placeholder="请选择类型"
          clearable
          class="!w-150px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.EXERCISE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-150px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.EXERCISE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['study:exercise:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:exercise:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column type="selection" width="55" />

      <!-- 练习名称 -->
      <el-table-column label="练习名称" align="left" prop="exerciseName" min-width="180">
        <template #default="scope">
          <div class="flex items-center gap-8px">
            <Icon icon="ep:edit-pen" class="text-primary text-16px" />
            <span class="font-medium">{{ scope.row.exerciseName }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 课程 -->
      <el-table-column label="课程" align="left" prop="courseName" min-width="150">
        <template #default="scope">
          <div v-if="scope.row.courseName" class="flex items-center gap-4px text-gray-600">
            <Icon icon="ep:collection" class="text-orange-500" />
            {{ scope.row.courseName }}
          </div>
          <el-tag v-else type="info" size="small">未指定</el-tag>
        </template>
      </el-table-column>

      <!-- 关联范围 -->
      <el-table-column label="关联范围" align="left" min-width="150">
        <template #default="scope">
          <div v-if="scope.row.chapterName" class="flex items-center gap-4px text-gray-600">
            <Icon icon="ep:folder" class="text-blue-500" />
            <span class="text-12px">{{ scope.row.chapterName }}</span>
          </div>
          <div v-else-if="scope.row.knowledgePointName" class="flex items-center gap-4px text-gray-600">
            <Icon icon="ep:lightbulb" class="text-yellow-500" />
            <span class="text-12px">{{ scope.row.knowledgePointName }}</span>
          </div>
          <div v-else-if="scope.row.exerciseType === 1" class="flex items-center gap-4px text-purple-500">
            <Icon icon="ep:magic-stick" />
            <span class="text-12px">AI生成</span>
          </div>
          <el-tag v-else type="info" size="small">整课程</el-tag>
        </template>
      </el-table-column>

      <!-- 类型 -->
      <el-table-column label="类型" align="center" prop="exerciseType" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.EXERCISE_TYPE" :value="scope.row.exerciseType" />
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.EXERCISE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>

      <!-- 进度/得分 -->
      <el-table-column label="进度/得分" align="center" width="120">
        <template #default="scope">
          <!-- 已完成：显示分数 -->
          <div v-if="scope.row.status === 2" class="score-display">
            <span class="score-value" :class="getScoreClass(scope.row.score)">
              {{ scope.row.score }}
            </span>
            <span class="score-total">/{{ scope.row.questionCount * 20 }}</span>
          </div>
          <!-- 进行中：显示进度条 -->
          <div v-else-if="scope.row.status === 1" class="progress-display">
            <el-progress
              :percentage="getProgressPercent(scope.row)"
              :stroke-width="6"
              :show-text="false"
            />
            <span class="progress-text">{{ scope.row.answeredCount || 0 }}/{{ scope.row.questionCount }}</span>
          </div>
          <!-- 未开始 -->
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>

      <!-- 题目数量 -->
      <el-table-column label="题数" align="center" prop="questionCount" width="70">
        <template #default="scope">
          <el-tag size="small" type="info">{{ scope.row.questionCount }}题</el-tag>
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="160px"
      />

      <!-- 操作 -->
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <!-- 开始练习/继续练习 -->
          <el-button
            v-if="scope.row.status === 0"
            link
            type="primary"
            @click="handleStartExercise(scope.row)"
          >
            <Icon icon="ep:video-play" class="mr-4px" />
            开始
          </el-button>
          <el-button
            v-else-if="scope.row.status === 1"
            link
            type="warning"
            @click="handleContinueExercise(scope.row)"
          >
            <Icon icon="ep:refresh-right" class="mr-4px" />
            继续
          </el-button>
          <el-button
            v-else
            link
            type="success"
            @click="handleViewResult(scope.row)"
          >
            <Icon icon="ep:view" class="mr-4px" />
            查看
          </el-button>
          <el-button
            link
            type="info"
            @click="handleViewDetail(scope.row.id)"
          >
            详情
          </el-button>

          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['study:exercise:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:exercise:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ExerciseForm ref="formRef" @success="getList" />

  <!-- 详情抽屉 -->
  <ExerciseDetailDrawer ref="detailDrawerRef" />
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ExerciseApi, Exercise } from '@/api/study/exercise'
import { CourseApi } from '@/api/study/course'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'
import ExerciseForm from './ExerciseForm.vue'
import ExerciseDetailDrawer from './ExerciseDetailDrawer.vue'
import { useRouter } from 'vue-router'

/** 练习主 列表 */
defineOptions({ name: 'Exercise' })

const message = useMessage()
const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const list = ref<Exercise[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  exerciseName: undefined,
  userId: undefined,
  courseId: undefined,
  exerciseType: undefined,
  status: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)
const courseList = ref<any[]>([])
const courseLoading = ref(false)

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

// 获取进度百分比
const getProgressPercent = (row: Exercise) => {
  if (!row.questionCount) return 0
  const answered = row.answeredCount || 0
  return Math.round((answered / row.questionCount) * 100)
}

// 获取分数样式类
const getScoreClass = (score: number) => {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ExerciseApi.getExercisePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const detailDrawerRef = ref()

const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 查看详情抽屉 */
const handleViewDetail = (id: number) => {
  detailDrawerRef.value.open(id)
}

/** 开始练习 */
const handleStartExercise = (row: Exercise) => {
  router.push({
    path: '/study/exercise/do',
    query: { id: row.id }
  })
}

/** 继续练习 */
const handleContinueExercise = (row: Exercise) => {
  router.push({
    path: '/study/exercise/do',
    query: { id: row.id }
  })
}

/** 查看结果 */
const handleViewResult = (row: Exercise) => {
  router.push({
    path: '/study/exercise/result',
    query: { id: row.id }
  })
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ExerciseApi.deleteExercise(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await ExerciseApi.exportExercise(queryParams)
    download.excel(data, '练习主.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

<style scoped>
.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
}

.score-excellent {
  color: var(--el-color-success);
}

.score-pass {
  color: var(--el-color-warning);
}

.score-fail {
  color: var(--el-color-danger);
}

.score-total {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.progress-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.progress-display :deep(.el-progress) {
  width: 80px;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
