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
      <el-form-item label="练习" prop="exerciseId">
        <el-select
          v-model="queryParams.exerciseId"
          placeholder="请选择所属练习"
          clearable
          filterable
          remote
          :remote-method="fetchExerciseList"
          :loading="exerciseLoading"
          class="!w-240px"
          @focus="fetchExerciseList('')"
        >
          <el-option
            v-for="item in exerciseList"
            :key="item.id"
            :label="item.exerciseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="题型" prop="questionType">
        <el-select
          v-model="queryParams.questionType"
          placeholder="请选择题型"
          clearable
          class="!w-160px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.QUESTION_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来源" prop="sourceType">
        <el-select
          v-model="queryParams.sourceType"
          placeholder="请选择来源类型"
          clearable
          class="!w-160px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.SOURCE_TYPE)"
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
          v-hasPermi="['study:exercise-question:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:exercise-question:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['study:exercise-question:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 批量操作栏 -->
  <ContentWrap v-if="checkedIds.length > 0" class="mb-8px">
    <div class="batch-bar">
      <div class="batch-info">
        <el-tag type="primary" effect="dark">已选 {{ checkedIds.length }} 项</el-tag>
      </div>
      <div class="batch-actions">
        <el-button type="danger" link @click="handleDeleteBatch">
          <Icon icon="ep:delete" class="mr-4px" />
          批量删除
        </el-button>
        <el-button type="info" link @click="clearSelection">
          取消选择
        </el-button>
      </div>
    </div>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
        ref="tableRef"
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="编号" align="center" prop="id" width="70" />

      <!-- 题型 -->
      <el-table-column label="题型" align="center" prop="questionType" width="90">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.QUESTION_TYPE" :value="scope.row.questionType" />
        </template>
      </el-table-column>

      <!-- 题目内容 -->
      <el-table-column label="题目内容" align="left" prop="questionContent" min-width="250" show-overflow-tooltip>
        <template #default="scope">
          <div class="flex items-center gap-8px">
            <Icon icon="ep:question-filled" class="text-primary" />
            <span>{{ scope.row.questionContent }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 选项预览 -->
      <el-table-column label="选项" align="left" min-width="200">
        <template #default="scope">
          <div v-if="scope.row.options && Object.keys(scope.row.options).length > 0" class="options-preview">
            <div
              v-for="(value, key) in scope.row.options"
              :key="key"
              class="option-tag"
              :class="{ 'is-correct': key === scope.row.correctAnswer }"
            >
              <span class="option-key">{{ key }}</span>
              <span class="option-value" :title="value">{{ value }}</span>
              <Icon v-if="key === scope.row.correctAnswer" icon="ep:check" class="correct-icon" />
            </div>
          </div>
          <el-tag v-else type="info" size="small">无选项</el-tag>
        </template>
      </el-table-column>

      <!-- 正确答案 -->
      <el-table-column label="正确答案" align="center" width="100">
        <template #default="scope">
          <el-tag
            v-if="scope.row.correctAnswer"
            :type="getCorrectAnswerTagType(scope.row)"
            effect="dark"
            class="correct-answer-tag"
          >
            {{ formatCorrectAnswer(scope.row) }}
          </el-tag>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>

      <!-- 来源 -->
      <el-table-column label="来源" align="center" prop="sourceType" width="90">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SOURCE_TYPE" :value="scope.row.sourceType" />
        </template>
      </el-table-column>

      <!-- 所属练习 -->
      <el-table-column label="所属练习" align="left" prop="exerciseName" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <div v-if="scope.row.exerciseName" class="flex items-center gap-4px text-gray-600">
            <Icon icon="ep:document" class="text-green-500" />
            {{ scope.row.exerciseName }}
          </div>
          <el-tag v-else type="info" size="small">未关联</el-tag>
        </template>
      </el-table-column>

      <!-- 排序 -->
      <el-table-column label="排序" align="center" prop="sort" width="70" />

      <!-- 操作 -->
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['study:exercise-question:update']"
          >
            <Icon icon="ep:edit" class="mr-4px" /> 编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:exercise-question:delete']"
          >
            <Icon icon="ep:delete" class="mr-4px" /> 删除
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
  <ExerciseQuestionForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ExerciseQuestionApi, ExerciseQuestion } from '@/api/study/exercisequestion'
import { ExerciseApi } from '@/api/study/exercise'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'
import ExerciseQuestionForm from './ExerciseQuestionForm.vue'

/** 练习题 列表 */
defineOptions({ name: 'ExerciseQuestion' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<ExerciseQuestion[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  exerciseId: undefined,
  questionType: undefined,
  sourceType: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)
const exerciseList = ref<any[]>([])
const exerciseLoading = ref(false)

// 搜索练习列表
const fetchExerciseList = async (query: string) => {
  exerciseLoading.value = true
  try {
    const data = await ExerciseApi.getExercisePage({
      pageNo: 1,
      pageSize: 20,
      exerciseName: query,
    })
    exerciseList.value = data.list
  } finally {
    exerciseLoading.value = false
  }
}

// 格式化正确答案显示
const formatCorrectAnswer = (row: ExerciseQuestion) => {
  if (row.questionType === 2) {
    // 判断题
    return row.correctAnswer === 'A' ? '正确' : '错误'
  }
  return row.correctAnswer
}

// 获取正确答案标签类型
const getCorrectAnswerTagType = (row: ExerciseQuestion) => {
  if (row.questionType === 1) return 'primary'
  if (row.questionType === 2) return 'success'
  return 'warning'
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ExerciseQuestionApi.getExerciseQuestionPage(queryParams)
    // 后端已经解析optionsJson到options，直接使用
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
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await ExerciseQuestionApi.deleteExerciseQuestion(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 批量删除练习题 */
const handleDeleteBatch = async () => {
  try {
    await message.delConfirm()
    await ExerciseQuestionApi.deleteExerciseQuestionList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const tableRef = ref()
const checkedIds = ref<number[]>([])

const handleRowCheckboxChange = (records: ExerciseQuestion[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

// 清空选择
const clearSelection = () => {
  tableRef.value?.clearSelection()
  checkedIds.value = []
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await ExerciseQuestionApi.exportExerciseQuestion(queryParams)
    download.excel(data, '练习题.xls')
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
.options-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  font-size: 12px;
  max-width: 180px;
}

.option-tag.is-correct {
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success);
}

.option-key {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
}

.option-tag.is-correct .option-key {
  background-color: var(--el-color-success);
}

.option-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.correct-icon {
  color: var(--el-color-success);
  font-size: 12px;
  flex-shrink: 0;
}

.correct-answer-tag {
  font-weight: bold;
  min-width: 50px;
  text-align: center;
}

.batch-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}
</style>
