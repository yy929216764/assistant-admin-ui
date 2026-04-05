<template>
  <div class="admin-home">
    <!-- 欢迎栏 -->
    <WelcomeHeaderAdmin />

    <!-- 统计卡片区域 -->
    <div class="section-title">
      <Icon icon="ep:data-board" /> 运营数据概览
    </div>
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <AdminStatCard
          title="学员总数"
          :value="dashboardData.totalStudents"
          icon="ep:user"
          color="#67C23A"
          :trend="8"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <AdminStatCard
          title="课程总数"
          :value="dashboardData.totalCourses"
          icon="ep:reading"
          color="#409EFF"
          :trend="3"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <AdminStatCard
          title="今日活跃"
          :value="dashboardData.todayActive"
          icon="ep:monitor"
          color="#E6A23C"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <AdminStatCard
          title="系统通知"
          :value="dashboardData.notifications"
          icon="ep:bell"
          color="#F56C6C"
        />
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14">
        <UserGrowthChart />
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
        <CourseHotChart />
      </el-col>
    </el-row>

    <!-- 管理快捷入口 -->
    <div class="section-title" style="margin-top: 24px;">
      <Icon icon="ep:menu" /> 管理快捷入口
    </div>
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="admin-action-card course" @click="goToCourse">
          <div class="action-icon"><Icon icon="ep:reading" /></div>
          <div class="action-title">课程管理</div>
          <div class="action-desc">管理课程与资料</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="admin-action-card user" @click="goToUser">
          <div class="action-icon"><Icon icon="ep:user" /></div>
          <div class="action-title">学员管理</div>
          <div class="action-desc">查看学员情况</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="admin-action-card stats" @click="goToStats">
          <div class="action-icon"><Icon icon="ep:data-analysis" /></div>
          <div class="action-title">数据统计</div>
          <div class="action-desc">查看学习统计</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="admin-action-card system" @click="goToSystem">
          <div class="action-icon"><Icon icon="ep:setting" /></div>
          <div class="action-title">系统配置</div>
          <div class="action-desc">配置系统参数</div>
        </div>
      </el-col>
    </el-row>

    <!-- 待办事项/系统通知 -->
    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span><Icon icon="ep:warning-filled" /> 待办事项</span>
              <el-badge :value="3" />
            </div>
          </template>
          <div class="todo-list">
            <div v-for="(todo, index) in todoList" :key="index" class="todo-item">
              <div class="todo-dot" :class="todo.type"></div>
              <div class="todo-content">{{ todo.content }}</div>
              <div class="todo-time">{{ todo.time }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span><Icon icon="ep:notification" /> 系统通知</span>
              <el-button type="primary" link size="small">查看全部</el-button>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="(notice, index) in noticeList" :key="index" class="notice-item">
              <div class="notice-icon" :class="notice.type">
                <Icon :icon="getNoticeIcon(notice.type)" />
              </div>
              <div class="notice-content">
                <div class="notice-title">{{ notice.title }}</div>
                <div class="notice-desc">{{ notice.desc }}</div>
              </div>
              <div class="notice-time">{{ notice.time }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WelcomeHeaderAdmin from './components/WelcomeHeaderAdmin.vue'
import AdminStatCard from './components/AdminStatCard.vue'
import UserGrowthChart from './components/UserGrowthChart.vue'
import CourseHotChart from './components/CourseHotChart.vue'
import { getAdminDashboard, type AdminDashboardVO } from '@/api/study/overview/admin'

/** 管理员首页 */
defineOptions({ name: 'AdminHome' })

const router = useRouter()
const message = useMessage()

// 看板数据
const dashboardData = ref<AdminDashboardVO>({
  totalStudents: 0,
  totalCourses: 0,
  todayActive: 0,
  notifications: 0,
  userGrowth: [],
  courseHot: [],
  studyTimeRank: []
})

const loading = ref(false)

// 获取看板数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const data = await getAdminDashboard()
    dashboardData.value = data
  } catch (error) {
    message.error('获取看板数据失败')
  } finally {
    loading.value = false
  }
}

// 待办事项
const todoList = ref([
  { type: 'urgent', content: '新课程资料审核', time: '2小时前' },
  { type: 'normal', content: '学员问题待回复', time: '4小时前' },
  { type: 'normal', content: '周报数据待导出', time: '昨天' }
])

// 系统通知
const noticeList = ref([
  { type: 'system', title: '系统更新', desc: '系统已升级至v2.0', time: '10分钟前' },
  { type: 'success', title: '备份完成', desc: '每日数据备份成功', time: '1小时前' },
  { type: 'warning', title: '存储告警', desc: '存储空间使用率超过80%', time: '2小时前' }
])

// 获取通知图标
const getNoticeIcon = (type: string) => {
  const icons: Record<string, string> = {
    system: 'ep:cpu',
    success: 'ep:success-filled',
    warning: 'ep:warning-filled'
  }
  return icons[type] || 'ep:info-filled'
}

// 跳转方法
const goToCourse = () => router.push('/study/course')
const goToUser = () => router.push('/study/usercourse')
const goToStats = () => router.push('/study/exercise')
const goToSystem = () => router.push('/system/user')

// 加载数据
onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped lang="scss">
.admin-home {
  padding: 20px;
  min-height: 100%;
  background: #f5f7fa;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    color: #67C23A;
  }
}

.stat-row {
  margin-top: 8px;
}

.admin-action-card {
  text-align: center;
  padding: 24px 16px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.1);
  }

  &.course:hover .action-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.user:hover .action-icon {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }

  &.stats:hover .action-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.system:hover .action-icon {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  .action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin: 0 auto 12px;
    border-radius: 50%;
    background: #f5f7fa;
    font-size: 28px;
    color: #606266;
    transition: all 0.3s;
  }

  .action-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }

  .action-desc {
    font-size: 12px;
    color: #909399;
  }
}

.todo-list {
  .todo-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .todo-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 12px;

      &.urgent {
        background: #F56C6C;
      }

      &.normal {
        background: #409EFF;
      }
    }

    .todo-content {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }

    .todo-time {
      font-size: 12px;
      color: #909399;
    }
  }
}

.notice-list {
  .notice-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .notice-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 12px;
      font-size: 16px;

      &.system {
        background: #f0f9ff;
        color: #409EFF;
      }

      &.success {
        background: #f6ffed;
        color: #52c41a;
      }

      &.warning {
        background: #fffbe6;
        color: #faad14;
      }
    }

    .notice-content {
      flex: 1;

      .notice-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .notice-desc {
        font-size: 12px;
        color: #909399;
      }
    }

    .notice-time {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}
</style>
