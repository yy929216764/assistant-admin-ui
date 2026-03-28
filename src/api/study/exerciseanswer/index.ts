import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户答题信息 */
export interface ExerciseAnswer {
          id: number; // 答题记录编号
          exerciseId?: number; // 练习编号
          questionId?: number; // 题目编号
          userId?: number; // 用户编号
          userAnswer: string; // 用户答案
          isCorrect: boolean; // 是否正确
          score: number; // 得分
          aiEvaluation: string; // AI评价(简答题预留)
          answerTimeMs: number; // 答题耗时(毫秒)
  }

// 用户答题 API
export const ExerciseAnswerApi = {
  // 查询用户答题分页
  getExerciseAnswerPage: async (params: any) => {
    return await request.get({ url: `/study/exercise-answer/page`, params })
  },

  // 查询用户答题详情
  getExerciseAnswer: async (id: number) => {
    return await request.get({ url: `/study/exercise-answer/get?id=` + id })
  },

  // 新增用户答题
  createExerciseAnswer: async (data: ExerciseAnswer) => {
    return await request.post({ url: `/study/exercise-answer/create`, data })
  },

  // 修改用户答题
  updateExerciseAnswer: async (data: ExerciseAnswer) => {
    return await request.put({ url: `/study/exercise-answer/update`, data })
  },

  // 删除用户答题
  deleteExerciseAnswer: async (id: number) => {
    return await request.delete({ url: `/study/exercise-answer/delete?id=` + id })
  },

  /** 批量删除用户答题 */
  deleteExerciseAnswerList: async (ids: number[]) => {
    return await request.delete({ url: `/study/exercise-answer/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户答题 Excel
  exportExerciseAnswer: async (params) => {
    return await request.download({ url: `/study/exercise-answer/export-excel`, params })
  },
}