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
      <el-form-item label="课程名称" prop="courseName">
        <el-input
          v-model="queryParams.courseName"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="课程封面URL" prop="courseCover">
        <el-input
          v-model="queryParams.courseCover"
          placeholder="请输入课程封面URL"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="课程简介" prop="courseIntro">
        <el-input
          v-model="queryParams.courseIntro"
          placeholder="请输入课程简介"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="学习目标" prop="courseTarget">
        <el-input
          v-model="queryParams.courseTarget"
          placeholder="请输入学习目标"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="难度等级 1-初级 2-中级 3-高级" prop="difficultyLevel">
        <el-input
          v-model="queryParams.difficultyLevel"
          placeholder="请输入难度等级 1-初级 2-中级 3-高级"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态 0-草稿 1-已发布 2-已下架" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态 0-草稿 1-已发布 2-已下架"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="教师用户编号（可空，首版弱化教师角色依赖）" prop="teacherId">
        <el-input
          v-model="queryParams.teacherId"
          placeholder="请输入教师用户编号（可空，首版弱化教师角色依赖）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="AI知识库编号，对应 ai_knowledge.id" prop="aiKnowledgeId">
        <el-input
          v-model="queryParams.aiKnowledgeId"
          placeholder="请输入AI知识库编号，对应 ai_knowledge.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="课程默认问答模型编号，对应 ai_model.id" prop="defaultModelId">
        <el-input
          v-model="queryParams.defaultModelId"
          placeholder="请输入课程默认问答模型编号，对应 ai_model.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input
          v-model="queryParams.sort"
          placeholder="请输入排序"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
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
          v-hasPermi="['study:course:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:course:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['study:course:delete']"
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
      <el-table-column label="课程编号" align="center" prop="id" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="课程封面URL" align="center" prop="courseCover" />
      <el-table-column label="课程简介" align="center" prop="courseIntro" />
      <el-table-column label="学习目标" align="center" prop="courseTarget" />
      <el-table-column label="难度等级 1-初级 2-中级 3-高级" align="center" prop="difficultyLevel" />
      <el-table-column label="状态 0-草稿 1-已发布 2-已下架" align="center" prop="status" />
      <el-table-column label="教师用户编号（可空，首版弱化教师角色依赖）" align="center" prop="teacherId" />
      <el-table-column label="AI知识库编号，对应 ai_knowledge.id" align="center" prop="aiKnowledgeId" />
      <el-table-column label="课程默认问答模型编号，对应 ai_model.id" align="center" prop="defaultModelId" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="180px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['study:course:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="success"
            @click="handleAiChat(scope.row)"
          >
            AI问答
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:course:delete']"
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
  <CourseForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CourseApi, Course } from '@/api/study/course'
import CourseForm from './CourseForm.vue'

/** 课程 列表 */
defineOptions({ name: 'Course' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Course[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  courseName: undefined,
  courseCover: undefined,
  courseIntro: undefined,
  courseTarget: undefined,
  difficultyLevel: undefined,
  status: undefined,
  teacherId: undefined,
  aiKnowledgeId: undefined,
  defaultModelId: undefined,
  sort: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CourseApi.getCoursePage(queryParams)
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
    await CourseApi.deleteCourse(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除课程 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await CourseApi.deleteCourseList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Course[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** AI问答按钮操作 */
const handleAiChat = async (row: Course) => {
  if (!row.aiKnowledgeId) {
    message.error('该课程未绑定知识库，无法进行AI问答')
    return
  }
  // 跳转到学习问答页面，带上课程ID
  window.open(`#/study/ai-tutor?courseId=${row.id}`, '_blank')
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CourseApi.exportCourse(queryParams)
    download.excel(data, '课程.xls')
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