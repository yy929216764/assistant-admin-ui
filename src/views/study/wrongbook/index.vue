<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="80px"
    >
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
      <el-form-item label="题型" prop="questionType">
        <el-select
          v-model="queryParams.questionType"
          placeholder="请选择题型"
          clearable
          class="!w-150px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.QUESTION_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="掌握状态" prop="masterStatus">
        <el-select
          v-model="queryParams.masterStatus"
          placeholder="请选择状态"
          clearable
          class="!w-150px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.MASTER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="错误次数≥" prop="wrongCount">
        <el-input-number
          v-model="queryParams.wrongCount"
          :min="0"
          :max="99"
          class="!w-100px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:wrong-book:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 统计信息 -->
  <ContentWrap class="mb-16px">
    <div class="flex items-center gap-24px">
      <div class="stat-item">
        <span class="stat-label">总错题数</span>
        <span class="stat-value">{{ total }}</span>
      </div>
      <el-divider direction="vertical" />
      <div class="stat-item">
        <span class="stat-label">未掌握</span>
        <span class="stat-value text-orange-500">{{ unmasteredCount }}</span>
      </div>
      <el-divider direction="vertical" />
      <div class="stat-item">
        <span class="stat-label">已掌握</span>
        <span class="stat-value text-green-500">{{ masteredCount }}</span>
      </div>
    </div>
  </ContentWrap>

  <!-- 错题卡片列表 -->
  <ContentWrap>
    <div v-if="list.length === 0 && !loading" class="text-center py-48px">
      <el-empty description="暂无错题记录" />
    </div>

    <div v-else class="wrong-book-grid">
      <div
        v-for="item in list"
        :key="item.id"
        class="wrong-book-card"
        :class="{ 'is-mastered': item.masterStatus === 1 }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="header-left">
            <el-tag size="small" effect="plain" class="course-tag">
              <Icon icon="ep:collection" class="mr-4px" />
              {{ item.courseName || '未知课程' }}
            </el-tag>
            <dict-tag :type="DICT_TYPE.QUESTION_TYPE" :value="item.questionType" />
          </div>
          <div class="header-right">
            <el-tag
              :type="item.masterStatus === 1 ? 'success' : 'warning'"
              size="small"
              effect="dark"
            >
              {{ item.masterStatus === 1 ? '已掌握' : `错误${item.wrongCount}次` }}
            </el-tag>
          </div>
        </div>

        <!-- 题目内容 -->
        <div class="question-content">
          <div class="question-text">{{ item.questionContent }}</div>

          <!-- 选项展示 -->
          <div v-if="item.options && Object.keys(item.options).length > 0" class="options-list">
            <div
              v-for="(value, key) in item.options"
              :key="key"
              class="option-item"
              :class="{
                'is-correct': key === item.correctAnswer,
                'is-wrong': key === item.userAnswer && key !== item.correctAnswer
              }"
            >
              <span class="option-key">{{ key }}</span>
              <span class="option-value">{{ value }}</span>
              <el-icon v-if="key === item.correctAnswer" class="correct-icon"><Circle-Check /></el-icon>
              <el-icon v-if="key === item.userAnswer && key !== item.correctAnswer" class="wrong-icon"><Circle-Close /></el-icon>
            </div>
          </div>

          <!-- 简答题答案对比 -->
          <div v-else-if="item.questionType === 3" class="answer-compare">
            <div class="answer-item wrong">
              <span class="answer-label">你的答案：</span>
              <span class="answer-content">{{ item.userAnswer || '未作答' }}</span>
            </div>
            <div class="answer-item correct">
              <span class="answer-label">参考答案：</span>
              <span class="answer-content">{{ item.correctAnswer }}</span>
            </div>
          </div>
        </div>

        <!-- 答案对比（选择题） -->
        <div v-if="item.questionType !== 3" class="answer-summary">
          <div class="summary-item">
            <span class="label">你的答案：</span>
            <el-tag
              :type="item.userAnswer === item.correctAnswer ? 'success' : 'danger'"
              size="small"
            >
              {{ item.userAnswer || '未作答' }}
            </el-tag>
          </div>
          <div class="summary-item">
            <span class="label">正确答案：</span>
            <el-tag type="success" size="small">{{ item.correctAnswer }}</el-tag>
          </div>
        </div>

        <!-- 最后错误时间 -->
        <div class="card-footer">
          <div class="footer-info">
            <Icon icon="ep:clock" class="text-gray-400 mr-4px" />
            <span class="text-12px text-gray-400">{{ formatDate(item.lastWrongTime) }}</span>
          </div>
          <div class="footer-actions">
            <el-button
              v-if="item.masterStatus !== 1"
              link
              type="success"
              size="small"
              @click="handleMaster(item.id)"
            >
              <Icon icon="ep:check" class="mr-4px" />
              标记掌握
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="handleRetry(item.id)"
            >
              <Icon icon="ep:refresh" class="mr-4px" />
              重练
            </el-button>
            <el-button
              link
              type="info"
              size="small"
              @click="handleViewDetail(item.id)"
            >
              详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <Pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
      class="mt-24px"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { WrongBookApi, WrongBook } from '@/api/study/wrongbook'
import { CourseApi } from '@/api/study/course'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

/** 错题本 列表 */
defineOptions({ name: 'WrongBook' })

const message = useMessage()
const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const list = ref<WrongBook[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  courseId: undefined,
  questionType: undefined,
  masterStatus: undefined,
  wrongCount: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)
const courseList = ref<any[]>([])
const courseLoading = ref(false)

// 统计数量
const unmasteredCount = computed(() => {
  return list.value.filter(item => item.masterStatus !== 1).length
})

const masteredCount = computed(() => {
  return list.value.filter(item => item.masterStatus === 1).length
})

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

// 解析选项JSON
const parseOptionsJson = (json: string | undefined) => {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await WrongBookApi.getWrongBookPage(queryParams)
    // 解析选项JSON
    list.value = data.list.map((item: WrongBook) => ({
      ...item,
      options: parseOptionsJson(item.optionsJson)
    }))
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

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return dateFormatter(date, 'YYYY-MM-DD HH:mm')
}

/** 标记掌握 */
const handleMaster = async (id: number) => {
  try {
    await message.confirm('确定将此题标记为已掌握吗？', '提示')
    await WrongBookApi.masterWrongBook(id)
    message.success('已标记为掌握')
    await getList()
  } catch {}
}

/** 重新练习 */
const handleRetry = async (id: number) => {
  try {
    const res = await WrongBookApi.retryWrongBook([id])
    ElMessage.success('错题练习已生成')
    // 跳转到练习页面
    router.push({
      path: '/study/exercise/do',
      query: { id: res }
    })
  } catch (error) {
    ElMessage.error('生成练习失败')
  }
}

/** 查看详情 */
const handleViewDetail = (id: number) => {
  router.push({
    path: '/study/wrong-book/detail',
    query: { id }
  })
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await WrongBookApi.exportWrongBook(queryParams)
    download.excel(data, '错题本.xls')
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
.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.wrong-book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 16px;
}

.wrong-book-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  transition: all 0.3s;
}

.wrong-book-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wrong-book-card.is-mastered {
  background-color: var(--el-fill-color-light);
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-tag {
  color: var(--el-text-color-secondary);
}

.question-content {
  margin-bottom: 16px;
}

.question-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  border: 1px solid transparent;
}

.option-item.is-correct {
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success);
}

.option-item.is-wrong {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger);
}

.option-key {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.is-correct .option-key {
  background-color: var(--el-color-success);
}

.is-wrong .option-key {
  background-color: var(--el-color-danger);
}

.option-value {
  flex: 1;
  font-size: 14px;
}

.correct-icon {
  color: var(--el-color-success);
  font-size: 16px;
}

.wrong-icon {
  color: var(--el-color-danger);
  font-size: 16px;
}

.answer-compare {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.answer-item.wrong {
  background-color: var(--el-color-danger-light-9);
}

.answer-item.correct {
  background-color: var(--el-color-success-light-9);
}

.answer-label {
  font-weight: 500;
  white-space: nowrap;
}

.answer-item.wrong .answer-label {
  color: var(--el-color-danger);
}

.answer-item.correct .answer-label {
  color: var(--el-color-success);
}

.answer-content {
  flex: 1;
}

.answer-summary {
  display: flex;
  gap: 24px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  margin-bottom: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.summary-item .label {
  color: var(--el-text-color-secondary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.footer-info {
  display: flex;
  align-items: center;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .wrong-book-grid {
    grid-template-columns: 1fr;
  }
}
</style>
