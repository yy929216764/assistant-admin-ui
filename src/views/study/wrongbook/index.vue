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
      <el-form-item label="题型" prop="questionType">
        <el-select
          v-model="queryParams.questionType"
          placeholder="请选择题型"
          clearable
          class="!w-240px"
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
          placeholder="请选择掌握状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.MASTER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="错误次数>" prop="wrongCount">
        <el-input-number
          v-model="queryParams.wrongCount"
          placeholder="错误次数大于"
          :min="0"
          class="!w-240px"
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
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="课程" align="center" prop="courseName" width="150" />
      <el-table-column label="题型" align="center" prop="questionType" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.QUESTION_TYPE" :value="scope.row.questionType" />
        </template>
      </el-table-column>
      <el-table-column label="题目内容" align="center" prop="questionContent" min-width="200" show-overflow-tooltip />
      <el-table-column label="错误次数" align="center" prop="wrongCount" width="100" />
      <el-table-column label="掌握状态" align="center" prop="masterStatus" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MASTER_STATUS" :value="scope.row.masterStatus" />
        </template>
      </el-table-column>
      <el-table-column
        label="最后错误时间"
        align="center"
        prop="lastWrongTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="180px" fixed="right">
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
import { CourseApi } from '@/api/study/course'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'
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
  courseId: undefined,
  questionType: undefined,
  masterStatus: undefined,
  wrongCount: undefined,
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
