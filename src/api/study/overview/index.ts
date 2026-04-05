import request from '@/config/axios'

// 学习概览统计响应
export interface StudyOverviewVO {
  // 问答统计
  totalQuestions: number
  // 答题统计
  totalAnswers: number
  correctAnswers: number
  wrongAnswers: number
  correctRate: number
  // 练习统计
  totalExercises: number
  averageScore: number
  // 错题统计
  wrongBookCount: number
  masteredCount: number
  totalWrongQuestions: number
  // 最近活动
  recentActivities: RecentActivityVO[]
}

// 最近学习活动
export interface RecentActivityVO {
  type: 'question' | 'exercise' | 'wrongbook'
  title: string
  description: string
  time: string
  relatedId: number
  courseName?: string
}

// 获取学习概览统计
export const getStudyOverview = () => {
  return request.get<StudyOverviewVO>({ url: '/study/overview/get' })
}
