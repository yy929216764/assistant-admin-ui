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
      <el-form-item label="资料名称" prop="materialName">
        <el-input
          v-model="queryParams.materialName"
          placeholder="请输入资料名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资料类型" prop="materialType">
        <el-select
          v-model="queryParams.materialType"
          placeholder="请选择资料类型"
          clearable
          class="!w-240px"
        >
          <el-option label="PDF" :value="1" />
          <el-option label="Word" :value="2" />
          <el-option label="Markdown" :value="3" />
          <el-option label="文本" :value="4" />
          <el-option label="视频" :value="5" />
          <el-option label="其他" :value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="同步状态" prop="syncStatus">
        <el-select
          v-model="queryParams.syncStatus"
          placeholder="请选择同步状态"
          clearable
          class="!w-240px"
        >
          <el-option label="待同步" :value="0" />
          <el-option label="同步中" :value="1" />
          <el-option label="同步成功" :value="2" />
          <el-option label="同步失败" :value="3" />
        </el-select>
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
            type="warning"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleSyncBatch"
            v-hasPermi="['study:material:update']"
        >
          <Icon icon="ep:upload" class="mr-5px" /> 批量同步到知识库
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
      <el-table-column label="资料编号" align="center" prop="id" width="80" />
      <el-table-column label="资料名称" align="center" prop="materialName" min-width="150" />
      <el-table-column label="资料类型" align="center" prop="materialType" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.materialType === 1" type="primary">PDF</el-tag>
          <el-tag v-else-if="scope.row.materialType === 2" type="success">Word</el-tag>
          <el-tag v-else-if="scope.row.materialType === 3" type="info">Markdown</el-tag>
          <el-tag v-else-if="scope.row.materialType === 4">文本</el-tag>
          <el-tag v-else-if="scope.row.materialType === 5" type="warning">视频</el-tag>
          <el-tag v-else type="danger">其他</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" align="center" prop="fileSize" width="100">
        <template #default="scope">
          {{ formatFileSize(scope.row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column label="知识库" align="center" prop="aiKnowledgeId" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.aiKnowledgeId" type="success">已绑定</el-tag>
          <el-tag v-else type="info">未绑定</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="同步状态" align="center" prop="syncStatus" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.syncStatus === 0" type="info">待同步</el-tag>
          <el-tag v-else-if="scope.row.syncStatus === 1" type="warning">同步中</el-tag>
          <el-tag v-else-if="scope.row.syncStatus === 2" type="success">同步成功</el-tag>
          <el-tag v-else-if="scope.row.syncStatus === 3" type="danger">
            <el-tooltip :content="scope.row.syncErrorMsg || '同步失败'" placement="top">
              <span>同步失败</span>
            </el-tooltip>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="最近同步时间"
        align="center"
        prop="syncTime"
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
      <el-table-column label="操作" align="center" fixed="right" min-width="180px">
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
            type="success"
            @click="handleSync(scope.row.id)"
            v-hasPermi="['study:material:update']"
            :disabled="scope.row.syncStatus === 1 || !scope.row.aiKnowledgeId"
          >
            同步
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
  syncStatus: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 格式化文件大小 */
const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

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

/** 同步到知识库 */
const handleSync = async (id: number) => {
  try {
    await message.confirm('确认将资料同步到知识库？')
    await MaterialApi.syncToKnowledge(id)
    message.success('同步任务已提交，请稍后刷新查看状态')
    getList()
  } catch {}
}

/** 批量同步到知识库 */
const handleSyncBatch = async () => {
  try {
    await message.confirm(`确认批量同步 ${checkedIds.value.length} 条资料到知识库？`)
    await MaterialApi.syncListToKnowledge(checkedIds.value)
    checkedIds.value = []
    message.success('批量同步任务已提交，请稍后刷新查看状态')
    getList()
  } catch {}
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
