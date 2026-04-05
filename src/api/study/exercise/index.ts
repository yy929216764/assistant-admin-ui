import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 练习主信息 */
export interface Exercise {
          id: number; // 练习编号
          exerciseName?: string; // 练习名称
          userId?: number; // 用户编号
          courseId?: number; // 课程编号
          chapterId: number; // 章节编号
          knowledgePointId: number; // 知识点编号
          exerciseType?: number; // 练习类型 1-AI生成 2-固定练习
          questionCount?: number; // 题目数量
          status?: number; // 状态 0-未开始 1-进行中 2-已完成
          score: number; // 得分
          correctCount: number; // 正确题数
          generateModelId: number; // 生成题目使用的模型编号，对应 ai_model.id
          generateConversationId: number; // 生成题目使用的AI对话编号，对应 ai_chat_conversation.id
          promptSnapshot: string; // 生成题目时的提示词快照
          startTime: string | Dayjs; // 开始时间
          submitTime: string | Dayjs; // 提交时间
  }

// 练习主 API
export const ExerciseApi = {
  // 查询练习主分页
  getExercisePage: async (params: any) => {
    return await request.get({ url: `/study/exercise/page`, params })
  },

  // 查询练习主详情
  getExercise: async (id: number) => {
    return await request.get({ url: `/study/exercise/get?id=` + id })
  },

  // 新增练习主
  createExercise: async (data: Exercise) => {
    return await request.post({ url: `/study/exercise/create`, data })
  },

  // 修改练习主
  updateExercise: async (data: Exercise) => {
    return await request.put({ url: `/study/exercise/update`, data })
  },

  // 删除练习主
  deleteExercise: async (id: number) => {
    return await request.delete({ url: `/study/exercise/delete?id=` + id })
  },

  /** 批量删除练习主 */
  deleteExerciseList: async (ids: number[]) => {
    return await request.delete({ url: `/study/exercise/delete-list?ids=${ids.join(',')}` })
  },

  // 导出练习主 Excel
  exportExercise: async (params) => {
    return await request.download({ url: `/study/exercise/export-excel`, params })
  },

  // ==================== 阶段三新增：练习生成与答题接口 ====================

  // 生成AI练习题
  generateExercise: async (data: ExerciseGenerateReqVO) => {
    return await request.post({ url: `/study/exercise/generate`, data })
  },

  // 获取练习详情（含题目列表）
  getExerciseDetail: async (id: number) => {
    return await request.get({ url: `/study/exercise/detail?id=` + id })
  },

  // 提交答案
  submitAnswer: async (data: AnswerSubmitReqVO) => {
    return await request.post({ url: `/study/exercise/answer/submit`, data })
  },

  // 完成练习
  completeExercise: async (exerciseId: number) => {
    return await request.post({ url: `/study/exercise/complete`, params: { exerciseId } })
  },
}

/** 生成练习请求 */
export interface ExerciseGenerateReqVO {
  courseId: number
  knowledgePointId?: number
  questionCount?: number
  modelId?: number
}

/** 练习详情响应 */
export interface ExerciseDetailRespVO {
  id: number
  exerciseName: string
  courseId: number
  courseName: string
  chapterId?: number
  knowledgePointId?: number
  exerciseType: number
  status: number
  questionCount: number
  score?: number
  correctCount?: number
  startTime?: string
  submitTime?: string
  questions: ExerciseQuestionRespVO[]
}

/** 练习题响应 */
export interface ExerciseQuestionRespVO {
  id: number
  exerciseId: number
  questionType: number
  questionContent: string
  options?: Record<string, string>
  sort: number
  knowledgePointId?: number
  sourceType: number
  aiGenerated: boolean
  // 答题后返回的字段
  correctAnswer?: string
  analysis?: string
  userAnswer?: string
  isCorrect?: boolean
}

/** 提交答案请求 */
export interface AnswerSubmitReqVO {
  exerciseId: number
  questionId: number
  userAnswer?: string
  isLastQuestion?: boolean
  answerTimeMs?: number
}

/** 提交答案响应 */
export interface AnswerSubmitRespVO {
  isCorrect: boolean
  correctAnswer?: string
  analysis?: string
  isCompleted: boolean
  nextQuestionId?: number
  score?: number
}

/** 练习结果响应 */
export interface ExerciseResultRespVO {
  exerciseId: number
  exerciseName: string
  score: number
  totalScore: number
  correctCount: number
  totalCount: number
  accuracy: number
  wrongBookAddedCount: number
  answerResults: ExerciseAnswerResultVO[]
}

/** 答题结果项 */
export interface ExerciseAnswerResultVO {
  questionId: number
  questionContent: string
  questionType: number
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  analysis: string
  score: number
}