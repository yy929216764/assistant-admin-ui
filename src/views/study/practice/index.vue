<template>
  <ContentWrap>
    <!-- 页面标题 -->
    <div class="practice-header">
      <div class="header-content">
        <h1 class="page-title">
          <Icon icon="ep:edit-pen" class="title-icon" />
          练习中心
        </h1>
        <p class="page-desc">选择课程开始练习，提升学习效果</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <div class="stat-value">{{ courseList.length }}</div>
          <div class="stat-label">已选课程</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalWrongCount }}</div>
          <div class="stat-label">待复习错题</div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-form :model="queryParams" :inline="true" class="search-form">
      <el-form-item>
        <el-input
          v-model="queryParams.courseName"
          placeholder="搜索课程名称"
          clearable
          style="width: 300px"
          @keyup.enter="handleQuery"
        >
          <template #prefix>
            <Icon icon="ep:search" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-4px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-4px" /> 重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 课程卡片列表 -->
  <ContentWrap>
    <el-empty v-if="!loading && courseList.length === 0" description="暂无课程数据" />

    <div v-loading="loading" class="course-grid">
      <div
        v-for="course in courseList"
        :key="course.id"
        class="course-card"
        @click="goToCoursePractice(course)"
      >
        <!-- 课程封面 -->
        <div class="course-cover">
          <img
            v-if="course.courseCover"
            :src="course.courseCover"
            :alt="course.courseName"
            class="cover-image"
          />
          <div v-else class="cover-placeholder">
            <Icon icon="ep:collection" class="placeholder-icon" />
          </div>
          <div class="cover-overlay">
            <el-button type="primary" size="large" round>
              <Icon icon="ep:video-play" class="mr-4px" />
              开始练习
            </el-button>
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-name" :title="course.courseName">{{ course.courseName }}</h3>
          <p class="course-intro" :title="course.courseIntro">{{ course.courseIntro || '暂无简介' }}</p>

          <!-- 统计信息 -->
          <div class="course-stats">
            <div class="stat">
              <Icon icon="ep:document" class="stat-icon text-primary" />
              <span>{{ course.exerciseCount || 0 }} 个练习</span>
            </div>
            <div class="stat">
              <Icon icon="ep:warning" class="stat-icon text-danger" />
              <span>{{ course.wrongCount || 0 }} 道错题</span>
            </div>
          </div>

          <!-- 难度标签 -->
          <div class="course-tags">
            <el-tag :type="getDifficultyType(course.difficultyLevel)" size="small">
              {{ getDifficultyLabel(course.difficultyLevel) }}
            </el-tag>
            <el-tag v-if="course.wrongCount > 0" type="danger" size="small" effect="plain">
              待复习
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <Pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { CourseApi } from '@/api/study/course'
import { WrongBookApi } from '@/api/study/wrongbook'
import { useRouter } from 'vue-router'

/** 练习中心 - 课程列表 */
defineOptions({ name: 'PracticeCenter' })

const router = useRouter()
const message = useMessage()

const loading = ref(true)
const courseList = ref<any[]>([])
const total = ref(0)
const totalWrongCount = ref(0)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 12,
  courseName: undefined,
})

// 难度等级映射
const difficultyMap: Record<number, { label: string; type: string }> = {
  1: { label: '初级', type: 'success' },
  2: { label: '中级', type: 'warning' },
  3: { label: '高级', type: 'danger' },
}

const getDifficultyLabel = (level?: number) => {
  return difficultyMap[level || 1]?.label || '初级'
}

const getDifficultyType = (level?: number) => {
  return difficultyMap[level || 1]?.type || 'success'
}

/** 查询课程列表 */
const getList = async () => {
  loading.value = true
  try {
    // 获取已发布的课程列表
    const data = await CourseApi.getCoursePage({
      ...queryParams,
      status: 1, // 只显示已发布的课程
    })

    // 为每个课程获取错题统计
    const coursesWithStats = await Promise.all(
      data.list.map(async (course: any) => {
        // 获取该课程的错题数
        try {
          const wrongBookData = await WrongBookApi.getWrongBookPage({
            courseId: course.id,
            masterStatus: 0, // 未掌握的错题
            pageNo: 1,
            pageSize: 1, // 只需要总数
          })
          return {
            ...course,
            wrongCount: wrongBookData.total || 0,
          }
        } catch {
          return {
            ...course,
            wrongCount: 0,
          }
        }
      })
    )

    courseList.value = coursesWithStats
    total.value = data.total

    // 计算总错题数
    totalWrongCount.value = coursesWithStats.reduce((sum, c) => sum + (c.wrongCount || 0), 0)
  } catch (error) {
    message.error('获取课程列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

/** 搜索 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置 */
const resetQuery = () => {
  queryParams.courseName = undefined
  handleQuery()
}

/** 进入课程练习页面 */
const goToCoursePractice = (course: any) => {
  router.push({
    path: '/study/practice/course',
    query: {
      courseId: course.id,
      courseName: course.courseName,
    },
  })
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>

<style scoped>
.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.title-icon {
  font-size: 28px;
  color: var(--el-color-primary);
}

.page-desc {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.search-form {
  margin-bottom: 0;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.course-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.course-cover {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .cover-overlay {
  opacity: 1;
}

.course-info {
  padding: 16px;
}

.course-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-intro {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 20px;
}

.course-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.course-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.stat-icon {
  font-size: 14px;
}

.course-tags {
  display: flex;
  gap: 8px;
}

:deep(.el-tag) {
  border-radius: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .practice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .course-grid {
    grid-template-columns: 1fr;
  }
}
</style>
