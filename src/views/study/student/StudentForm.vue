<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="学号" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入学号，如：2024001"
              :disabled="formType === 'update'"
            />
            <div class="text-gray-400 text-xs mt-1">学号作为登录账号，创建后不可修改</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="姓名" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属班级" prop="deptId">
            <el-tree-select
              v-model="formData.deptId"
              :data="deptList"
              :props="defaultProps"
              check-strictly
              node-key="id"
              placeholder="请选择班级"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="formData.mobile" maxlength="11" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" maxlength="50" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="性别">
            <el-select v-model="formData.sex" placeholder="请选择">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="初始密码" prop="password" v-if="formType === 'create'">
            <el-input
              v-model="formData.password"
              placeholder="请输入初始密码"
              show-password
              type="password"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import * as PermissionApi from '@/api/system/permission'
import { FormRules } from 'element-plus'

defineOptions({ name: 'StudyStudentForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

// 学生角色ID
const STUDENT_ROLE_ID = 159

const formData = ref({
  id: undefined,
  username: '',
  nickname: '',
  deptId: undefined,
  mobile: '',
  email: '',
  sex: undefined,
  password: '',
  remark: '',
  status: CommonStatusEnum.ENABLE
})

const formRules = reactive<FormRules>({
  username: [
    { required: true, message: '学号不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]{4,20}$/, message: '学号只能包含字母、数字、下划线，长度4-20位', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '初始密码不能为空', trigger: 'blur' }],
  mobile: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ]
})

const formRef = ref()
const deptList = ref<Tree[]>([])

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增学员' : '修改学员'
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const userData = await UserApi.getUser(id)
      formData.value = { ...userData }
    } finally {
      formLoading.value = false
    }
  }

  // 加载部门树
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
}
defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return

  formLoading.value = true
  try {
    const data = formData.value as unknown as UserApi.UserVO

    if (formType.value === 'create') {
      // 创建用户
      const userId = await UserApi.createUser(data)
      // 分配学生角色
      await PermissionApi.assignUserRole({
        userId: userId,
        roleIds: [STUDENT_ROLE_ID]
      })
      message.success(t('common.createSuccess'))
    } else {
      await UserApi.updateUser(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    username: '',
    nickname: '',
    deptId: undefined,
    mobile: '',
    email: '',
    sex: undefined,
    password: '',
    remark: '',
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}
</script>
