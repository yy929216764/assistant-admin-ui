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
      <el-form-item label="资料名称" prop="materialName">
        <el-input
          v-model="queryParams.materialName"
          placeholder="请输入资料名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资料类型 1-PDF 2-Word 3-Markdown 4-文本 5-视频 6-其他" prop="materialType">
        <el-select
          v-model="queryParams.materialType"
          placeholder="请选择资料类型 1-PDF 2-Word 3-Markdown 4-文本 5-视频 6-其他"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="文件URL" prop="fileUrl">
        <el-input
          v-model="queryParams.fileUrl"
          placeholder="请输入文件URL"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="文件大小(字节)" prop="fileSize">
        <el-input
          v-model="queryParams.fileSize"
          placeholder="请输入文件大小(字节)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="关联课程编号" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入关联课程编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="关联章节编号" prop="chapterId">
        <el-input
          v-model="queryParams.chapterId"
          placeholder="请输入关联章节编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="关联知识点编号" prop="knowledgePointId">
        <el-input
          v-model="queryParams.knowledgePointId"
          placeholder="请输入关联知识点编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="目标AI知识库编号，对应 ai_knowledge.id" prop="aiKnowledgeId">
        <el-input
          v-model="queryParams.aiKnowledgeId"
          placeholder="请输入目标AI知识库编号，对应 ai_knowledge.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="AI知识库文档编号，对应 ai_knowledge_document.id" prop="aiDocumentId">
        <el-input
          v-model="queryParams.aiDocumentId"
          placeholder="请输入AI知识库文档编号，对应 ai_knowledge_document.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="知识库同步状态 0-待同步 1-同步中 2-成功 3-失败" prop="syncStatus">
        <el-select
          v-model="queryParams.syncStatus"
          placeholder="请选择知识库同步状态 0-待同步 1-同步中 2-成功 3-失败"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="同步失败原因" prop="syncErrorMsg">
        <el-input
          v-model="queryParams.syncErrorMsg"
          placeholder="请输入同步失败原因"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="最近同步时间" prop="syncTime">
        <el-date-picker
          v-model="queryParams.syncTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="上传用户编号" prop="uploadUserId">
        <el-input
          v-model="queryParams.uploadUserId"
          placeholder="请输入上传用户编号"
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
          v-hasPermi="['study:material:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['study:material:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['study:material:delete']"
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
      <el-table-column label="资料编号" align="center" prop="id" />
      <el-table-column label="资料名称" align="center" prop="materialName" />
      <el-table-column label="资料类型 1-PDF 2-Word 3-Markdown 4-文本 5-视频 6-其他" align="center" prop="materialType" />
      <el-table-column label="文件URL" align="center" prop="fileUrl" />
      <el-table-column label="文件大小(字节)" align="center" prop="fileSize" />
      <el-table-column label="关联课程编号" align="center" prop="courseId" />
      <el-table-column label="关联章节编号" align="center" prop="chapterId" />
      <el-table-column label="关联知识点编号" align="center" prop="knowledgePointId" />
      <el-table-column label="目标AI知识库编号，对应 ai_knowledge.id" align="center" prop="aiKnowledgeId" />
      <el-table-column label="AI知识库文档编号，对应 ai_knowledge_document.id" align="center" prop="aiDocumentId" />
      <el-table-column label="知识库同步状态 0-待同步 1-同步中 2-成功 3-失败" align="center" prop="syncStatus" />
      <el-table-column label="同步失败原因" align="center" prop="syncErrorMsg" />
      <el-table-column
        label="最近同步时间"
        align="center"
        prop="syncTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="上传用户编号" align="center" prop="uploadUserId" />
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
            v-hasPermi="['study:material:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['study:material:delete']"
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
  <MaterialForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { MaterialApi, Material } from '@/api/study/material'
import MaterialForm from './MaterialForm.vue'

/** 学习资料 列表 */
defineOptions({ name: 'Material' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Material[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  materialName: undefined,
  materialType: undefined,
  fileUrl: undefined,
  fileSize: undefined,
  courseId: undefined,
  chapterId: undefined,
  knowledgePointId: undefined,
  aiKnowledgeId: undefined,
  aiDocumentId: undefined,
  syncStatus: undefined,
  syncErrorMsg: undefined,
  syncTime: [],
  uploadUserId: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MaterialApi.getMaterialPage(queryParams)
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
    await MaterialApi.deleteMaterial(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除学习资料 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await MaterialApi.deleteMaterialList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Material[]) => {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await MaterialApi.exportMaterial(queryParams)
    download.excel(data, '学习资料.xls')
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