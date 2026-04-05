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
      <el-form-item label="用户" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="queryParams.courseId"
          placeholder="请选择或搜索课程"
          clearable
          filterable
          remote
          :remote-method="fetchCourseList"
          :loading="courseLoading"
          class="!w-240px"
          @change="handleQuery"
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
      <el-form-item label="场景" prop="sceneType">
        <el-select
          v-model="queryParams.sceneType"
          placeholder="请选择场景类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.SCENE_TYPE)"
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
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.COMMON_STATUS)"
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
          v-hasPermi="['study:ai-conversation-ref:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:ai-conversation-ref:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['study:ai-conversation-ref:delete']"
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
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="用户" align="center" prop="userName" width="120" />
      <el-table-column label="课程" align="center" prop="courseName" width="150" />
      <el-table-column label="场景" align="center" prop="sceneType" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SCENE_TYPE" :value="scope.row.sceneType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['study:ai-conversation-ref:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:ai-conversation-ref:delete']"
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
  <AiConversationRefForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { AiConversationRefApi, AiConversationRef } from '@/api/study/aiconversationref'
import { CourseApi } from '@/api/study/course'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'
import AiConversationRefForm from './AiConversationRefForm.vue'

/** 学习场景与AI对话映射 列表 */
defineOptions({ name: 'AiConversationRef' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<AiConversationRef[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  courseId: undefined,
  sceneType: undefined,
  status: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const courseList = ref<any[]>([]) // 课程列表（用于下拉选择）
const courseLoading = ref(false) // 课程下拉加载中

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

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AiConversationRefApi.getAiConversationRefPage(queryParams)
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
    await AiConversationRefApi.deleteAiConversationRef(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除学习场景与AI对话映射 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await AiConversationRefApi.deleteAiConversationRefList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: AiConversationRef[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await AiConversationRefApi.exportAiConversationRef(queryParams)
    download.excel(data, '学习场景与AI对话映射.xls')
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
