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
      <el-form-item label="知识点编号" prop="knowledgePointId">
        <el-input
          v-model="queryParams.knowledgePointId"
          placeholder="请输入知识点编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="题目编号" prop="questionId">
        <el-input
          v-model="queryParams.questionId"
          placeholder="请输入题目编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="练习编号" prop="exerciseId">
        <el-input
          v-model="queryParams.exerciseId"
          placeholder="请输入练习编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="题型 1-单选 2-判断 3-简答" prop="questionType">
        <el-select
          v-model="queryParams.questionType"
          placeholder="请选择题型 1-单选 2-判断 3-简答"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目选项快照(JSON)" prop="optionsJson">
        <el-input
          v-model="queryParams.optionsJson"
          placeholder="请输入题目选项快照(JSON)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="正确答案快照" prop="correctAnswer">
        <el-input
          v-model="queryParams.correctAnswer"
          placeholder="请输入正确答案快照"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="题目解析快照" prop="questionAnalysis">
        <el-input
          v-model="queryParams.questionAnalysis"
          placeholder="请输入题目解析快照"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="当时作答答案" prop="userAnswer">
        <el-input
          v-model="queryParams.userAnswer"
          placeholder="请输入当时作答答案"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="错误次数" prop="wrongCount">
        <el-input
          v-model="queryParams.wrongCount"
          placeholder="请输入错误次数"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="掌握状态 0-未掌握 1-已掌握" prop="masterStatus">
        <el-select
          v-model="queryParams.masterStatus"
          placeholder="请选择掌握状态 0-未掌握 1-已掌握"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="AI错因分析结果" prop="aiAnalysis">
        <el-input
          v-model="queryParams.aiAnalysis"
          placeholder="请输入AI错因分析结果"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="复习建议" prop="reviewSuggestion">
        <el-input
          v-model="queryParams.reviewSuggestion"
          placeholder="请输入复习建议"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="分析使用模型编号，对应 ai_model.id" prop="analysisModelId">
        <el-input
          v-model="queryParams.analysisModelId"
          placeholder="请输入分析使用模型编号，对应 ai_model.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="分析使用AI对话编号，对应 ai_chat_conversation.id" prop="analysisConversationId">
        <el-input
          v-model="queryParams.analysisConversationId"
          placeholder="请输入分析使用AI对话编号，对应 ai_chat_conversation.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="分析结果消息编号，对应 ai_chat_message.id" prop="analysisMessageId">
        <el-input
          v-model="queryParams.analysisMessageId"
          placeholder="请输入分析结果消息编号，对应 ai_chat_message.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="最后错误时间" prop="lastWrongTime">
        <el-date-picker
          v-model="queryParams.lastWrongTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="掌握时间" prop="masterTime">
        <el-date-picker
          v-model="queryParams.masterTime"
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
          v-hasPermi="['study:wrong-book:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:wrong-book:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['study:wrong-book:delete']"
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
      <el-table-column label="错题记录编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="课程编号" align="center" prop="courseId" />
      <el-table-column label="知识点编号" align="center" prop="knowledgePointId" />
      <el-table-column label="题目编号" align="center" prop="questionId" />
      <el-table-column label="练习编号" align="center" prop="exerciseId" />
      <el-table-column label="题型 1-单选 2-判断 3-简答" align="center" prop="questionType" />
      <el-table-column label="题目内容快照" align="center" prop="questionContent" />
      <el-table-column label="题目选项快照(JSON)" align="center" prop="optionsJson" />
      <el-table-column label="正确答案快照" align="center" prop="correctAnswer" />
      <el-table-column label="题目解析快照" align="center" prop="questionAnalysis" />
      <el-table-column label="当时作答答案" align="center" prop="userAnswer" />
      <el-table-column label="错误次数" align="center" prop="wrongCount" />
      <el-table-column label="掌握状态 0-未掌握 1-已掌握" align="center" prop="masterStatus" />
      <el-table-column label="AI错因分析结果" align="center" prop="aiAnalysis" />
      <el-table-column label="复习建议" align="center" prop="reviewSuggestion" />
      <el-table-column label="分析使用模型编号，对应 ai_model.id" align="center" prop="analysisModelId" />
      <el-table-column label="分析使用AI对话编号，对应 ai_chat_conversation.id" align="center" prop="analysisConversationId" />
      <el-table-column label="分析结果消息编号，对应 ai_chat_message.id" align="center" prop="analysisMessageId" />
      <el-table-column
        label="最后错误时间"
        align="center"
        prop="lastWrongTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="掌握时间"
        align="center"
        prop="masterTime"
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
            v-hasPermi="['study:wrong-book:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:wrong-book:delete']"
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
  <WrongBookForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { WrongBookApi, WrongBook } from '@/api/study/wrongbook'
import WrongBookForm from './WrongBookForm.vue'

/** 错题本 列表 */
defineOptions({ name: 'WrongBook' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<WrongBook[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  courseId: undefined,
  knowledgePointId: undefined,
  questionId: undefined,
  exerciseId: undefined,
  questionType: undefined,
  questionContent: undefined,
  optionsJson: undefined,
  correctAnswer: undefined,
  questionAnalysis: undefined,
  userAnswer: undefined,
  wrongCount: undefined,
  masterStatus: undefined,
  aiAnalysis: undefined,
  reviewSuggestion: undefined,
  analysisModelId: undefined,
  analysisConversationId: undefined,
  analysisMessageId: undefined,
  lastWrongTime: [],
  masterTime: [],
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await WrongBookApi.getWrongBookPage(queryParams)
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
    await WrongBookApi.deleteWrongBook(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除错题本 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await WrongBookApi.deleteWrongBookList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: WrongBook[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
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