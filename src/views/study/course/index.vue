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
      <el-form-item label="难度等级" prop="difficultyLevel">
        <el-select
          v-model="queryParams.difficultyLevel"
          placeholder="请选择难度等级"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.COURSE_DIFFICULTY)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择课程状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.COURSE_STATUS)"
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
      <el-table-column label="课程编号" align="center" prop="id" width="80" />
      <el-table-column label="课程名称" align="center" prop="courseName" min-width="150" />
      <el-table-column label="难度等级" align="center" prop="difficultyLevel" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COURSE_DIFFICULTY" :value="scope.row.difficultyLevel" />
        </template>
      </el-table-column>
      <el-table-column label="AI问答" align="center" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.aiEnabled && scope.row.aiKnowledgeId" type="success">已启用</el-tag>
          <el-tag v-else-if="scope.row.aiEnabled" type="warning">初始化中</el-tag>
          <el-tag v-else type="info">未启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="课程状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COURSE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="220px" fixed="right">
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
            type="warning"
            :loading="exerciseLoading"
            @click="handleExercise(scope.row)"
          >
            开始练习
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
import { ExerciseApi } from '@/api/study/exercise'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'
import CourseForm from './CourseForm.vue'
import { useRouter } from 'vue-router'

/** 课程 列表 */
defineOptions({ name: 'Course' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const exerciseLoading = ref(false) // 生成练习的加载中
const list = ref<Course[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  courseName: undefined,
  difficultyLevel: undefined,
  status: undefined,
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
const handleAiChat = (row: Course) => {
  if (!row.aiKnowledgeId) {
    message.error('该课程未绑定知识库，无法进行AI问答')
    return
  }
  // 跳转到学习问答页面，带上课程ID
  router.push({
    path: '/study/ai-tutor',
    query: { courseId: row.id }
  })
}

/** 开始练习按钮操作 */
const handleExercise = async (row: Course) => {
  exerciseLoading.value = true
  try {
    // 生成练习
    const exerciseId = await ExerciseApi.generateExercise({
      courseId: row.id!,
      questionCount: 5
    })
    message.success('练习生成成功')
    // 跳转到练习页面
    router.push({
      path: '/study/exercise/do',
      query: { id: exerciseId }
    })
  } catch (error: any) {
    console.error('生成练习失败:', error)
    message.error('生成练习失败: ' + (error?.message || '未知错误'))
  } finally {
    exerciseLoading.value = false
  }
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
