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
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="课程编号" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入课程编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="章节编号" prop="chapterId">
        <el-input
          v-model="queryParams.chapterId"
          placeholder="请输入章节编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="知识点编号" prop="knowledgePointId">
        <el-input
          v-model="queryParams.knowledgePointId"
          placeholder="请输入知识点编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="练习类型 1-AI生成 2-固定练习" prop="exerciseType">
        <el-select
          v-model="queryParams.exerciseType"
          placeholder="请选择练习类型 1-AI生成 2-固定练习"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目数量" prop="questionCount">
        <el-input
          v-model="queryParams.questionCount"
          placeholder="请输入题目数量"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态 0-未开始 1-进行中 2-已完成" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态 0-未开始 1-进行中 2-已完成"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="得分" prop="score">
        <el-input
          v-model="queryParams.score"
          placeholder="请输入得分"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="正确题数" prop="correctCount">
        <el-input
          v-model="queryParams.correctCount"
          placeholder="请输入正确题数"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="生成题目使用的模型编号，对应 ai_model.id" prop="generateModelId">
        <el-input
          v-model="queryParams.generateModelId"
          placeholder="请输入生成题目使用的模型编号，对应 ai_model.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="生成题目使用的AI对话编号，对应 ai_chat_conversation.id" prop="generateConversationId">
        <el-input
          v-model="queryParams.generateConversationId"
          placeholder="请输入生成题目使用的AI对话编号，对应 ai_chat_conversation.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="生成题目时的提示词快照" prop="promptSnapshot">
        <el-input
          v-model="queryParams.promptSnapshot"
          placeholder="请输入生成题目时的提示词快照"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="提交时间" prop="submitTime">
        <el-date-picker
          v-model="queryParams.submitTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
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
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['study:exercise:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
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
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="练习编号" align="center" prop="id" />
      <el-table-column label="练习名称" align="center" prop="exerciseName" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="课程编号" align="center" prop="courseId" />
      <el-table-column label="章节编号" align="center" prop="chapterId" />
      <el-table-column label="知识点编号" align="center" prop="knowledgePointId" />
      <el-table-column label="练习类型 1-AI生成 2-固定练习" align="center" prop="exerciseType" />
      <el-table-column label="题目数量" align="center" prop="questionCount" />
      <el-table-column label="状态 0-未开始 1-进行中 2-已完成" align="center" prop="status" />
      <el-table-column label="得分" align="center" prop="score" />
      <el-table-column label="正确题数" align="center" prop="correctCount" />
      <el-table-column label="生成题目使用的模型编号，对应 ai_model.id" align="center" prop="generateModelId" />
      <el-table-column label="生成题目使用的AI对话编号，对应 ai_chat_conversation.id" align="center" prop="generateConversationId" />
      <el-table-column label="生成题目时的提示词快照" align="center" prop="promptSnapshot" />
      <el-table-column
        label="开始时间"
        align="center"
        prop="startTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="提交时间"
        align="center"
        prop="submitTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
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
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ExerciseApi, Exercise } from '@/api/study/exercise'
import ExerciseForm from './ExerciseForm.vue'

/** 练习主 列表 */
defineOptions({ name: 'Exercise' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Exercise[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  exerciseName: undefined,
  userId: undefined,
  courseId: undefined,
  chapterId: undefined,
  knowledgePointId: undefined,
  exerciseType: undefined,
  questionCount: undefined,
  status: undefined,
  score: undefined,
  correctCount: undefined,
  generateModelId: undefined,
  generateConversationId: undefined,
  promptSnapshot: undefined,
  startTime: [],
  submitTime: [],
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

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
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ExerciseApi.deleteExercise(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除练习主 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ExerciseApi.deleteExerciseList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Exercise[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
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