import request from '@/config/axios'

// 管理看板数据响应
export interface AdminDashboardVO {
  totalStudents: number
  totalCourses: number
  todayActive: number
  notifications: number
  userGrowth: UserGrowthVO[]
  courseHot: CourseHotVO[]
  studyTimeRank: StudyTimeRankVO[]
}

export interface UserGrowthVO {
  date: string
  count: number
}

export interface CourseHotVO {
  courseId: number
  courseName: string
  studyCount: number
}

export interface StudyTimeRankVO {
  userId: number
  nickname: string
  studyHours: number
}

// 获取管理看板数据
export const getAdminDashboard = () => {
  return request.get<AdminDashboardVO>({ url: '/study/admin/dashboard' })
}

// 获取学员增长趋势数据
export const getUserGrowthData = (days: number = 30) => {
  return request.get<UserGrowthVO[]>({
    url: '/study/admin/dashboard/growth',
    params: { days }
  })
}
