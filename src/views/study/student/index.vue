<template>
  <el-row :gutter="20">
    <!-- 左侧班级树 -->
    <el-col :span="4" :xs="24">
      <ContentWrap class="h-1/1">
        <div class="dept-tree-header">
          <span class="font-bold">班级列表</span>
        </div>
        <el-tree
          ref="treeRef"
          :data="deptList"
          :expand-on-click-node="false"
          :props="defaultProps"
          :filter-node-method="filterNode"
          default-expand-all
          highlight-current
          node-key="id"
          @node-click="handleDeptNodeClick"
        />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
      <!-- 搜索 -->
      <ContentWrap>
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="学号" prop="username">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入学号"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="姓名" prop="nickname">
            <el-input
              v-model="queryParams.nickname"
              placeholder="请输入姓名"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input
              v-model="queryParams.mobile"
              placeholder="请输入手机号"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
            <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
            <el-button
              type="primary"
              plain
              @click="openForm('create')"
              v-hasPermi="['study:student:create']"
            >
              <Icon icon="ep:plus" /> 新增学员
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <ContentWrap>
        <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="学号" align="center" prop="username" :show-overflow-tooltip="true" />
          <el-table-column label="姓名" align="center" prop="nickname" :show-overflow-tooltip="true" />
          <el-table-column label="班级" align="center" prop="deptName" :show-overflow-tooltip="true">
            <template #default="scope">
              <el-tag v-if="scope.row.deptName" type="info" size="small">{{ scope.row.deptName }}</el-tag>
              <span v-else class="text-gray-400">未分配</span>
            </template>
          </el-table-column>
          <el-table-column label="手机号" align="center" prop="mobile" width="120" />
          <el-table-column label="状态" key="status" align="center" width="100">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="handleStatusChange(scope.row)"
                :disabled="!checkPermi(['study:student:update'])"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column label="操作" align="center" width="180" fixed="right">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-button
                  type="primary"
                  link
                  @click="openForm('update', scope.row.id)"
                  v-hasPermi="['study:student:update']"
                >
                  <Icon icon="ep:edit" />修改
                </el-button>
                <el-dropdown
                  @command="(command) => handleCommand(command, scope.row)"
                  v-hasPermi="['study:student:delete', 'study:student:update-password']"
                >
                  <el-button type="primary" link><Icon icon="ep:d-arrow-right" /> 更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="handleDelete"
                        v-if="checkPermi(['study:student:delete'])"
                      >
                        <Icon icon="ep:delete" />删除
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleResetPwd"
                        v-if="checkPermi(['study:student:update-password'])"
                      >
                        <Icon icon="ep:key" />重置密码
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleViewStudy"
                      >
                        <Icon icon="ep:data-line" />学习记录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          :total="total"
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </ContentWrap>
    </el-col>
  </el-row>

  <!-- 添加或修改学员对话框 -->
  <StudentForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import { defaultProps, handleTree } from '@/utils/tree'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import * as RoleApi from '@/api/system/role'
import StudentForm from './StudentForm.vue'
import { ElTree } from 'element-plus'

defineOptions({ name: 'StudyStudent' })

const message = useMessage()
const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const total = ref(0)
const list = ref<UserApi.UserVO[]>([])
const deptList = ref<Tree[]>([])
const treeRef = ref<InstanceType<typeof ElTree>>()

// 学生角色ID（固定值，对应 system_role 表中的学生角色）
const STUDENT_ROLE_ID = 159

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: undefined,
  nickname: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  roleId: STUDENT_ROLE_ID,  // 默认查询学生角色
  createTime: []
})
const queryFormRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
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
  queryFormRef.value?.resetFields()
  queryParams.roleId = STUDENT_ROLE_ID
  handleQuery()
}

/** 获取部门树 */
const getDeptTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  deptList.value = handleTree(res)
}

/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

/** 处理部门被点击 */
const handleDeptNodeClick = async (row: any) => {
  if (row === undefined) {
    queryParams.deptId = undefined
  } else {
    queryParams.deptId = row.id
  }
  await getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 修改用户状态 */
const handleStatusChange = async (row: UserApi.UserVO) => {
  try {
    const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'
    await message.confirm(`确认要"${text}""${row.nickname}"学员吗?`)
    await UserApi.updateUserStatus(row.id, row.status)
    await getList()
  } catch {
    row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** 操作分发 */
const handleCommand = (command: string, row: UserApi.UserVO) => {
  switch (command) {
    case 'handleDelete':
      handleDelete(row.id)
      break
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleViewStudy':
      handleViewStudy(row)
      break
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await UserApi.deleteUser(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 批量删除 */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: UserApi.UserVO[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

/** 重置密码 */
const handleResetPwd = async (row: UserApi.UserVO) => {
  try {
    const result = await message.prompt(
      `请输入"${row.nickname}"的新密码`,
      t('common.reminder')
    )
    const password = result.value
    await UserApi.resetUserPassword(row.id, password)
    message.success('修改成功，新密码是：' + password)
  } catch {}
}

/** 查看学习记录 */
const handleViewStudy = (row: UserApi.UserVO) => {
  router.push(`/study/usercourse?userId=${row.id}`)
}

/** 初始化 */
onMounted(() => {
  getList()
  getDeptTree()
})
</script>

<style scoped>
.dept-tree-header {
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}
</style>
