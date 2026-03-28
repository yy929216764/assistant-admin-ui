import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 练习题信息 */
export interface ExerciseQuestion {
          id: number; // 题目编号
          exerciseId?: number; // 练习编号
          questionType?: number; // 题型 1-单选 2-判断 3-简答
          questionContent?: string; // 题目内容
          optionsJson: string; // 选项(JSON)
          correctAnswer: string; // 正确答案
          analysis: string; // 答案解析
          knowledgePointId: number; // 关联知识点编号
          sourceType?: number; // 来源类型 1-AI生成 2-预置题
          aiGenerated?: boolean; // 是否AI生成
          sort?: number; // 排序
  }

// 练习题 API
export const ExerciseQuestionApi = {
  // 查询练习题分页
  getExerciseQuestionPage: async (params: any) => {
    return await request.get({ url: `/study/exercise-question/page`, params })
  },

  // 查询练习题详情
  getExerciseQuestion: async (id: number) => {
    return await request.get({ url: `/study/exercise-question/get?id=` + id })
  },

  // 新增练习题
  createExerciseQuestion: async (data: ExerciseQuestion) => {
    return await request.post({ url: `/study/exercise-question/create`, data })
  },

  // 修改练习题
  updateExerciseQuestion: async (data: ExerciseQuestion) => {
    return await request.put({ url: `/study/exercise-question/update`, data })
  },

  // 删除练习题
  deleteExerciseQuestion: async (id: number) => {
    return await request.delete({ url: `/study/exercise-question/delete?id=` + id })
  },

  /** 批量删除练习题 */
  deleteExerciseQuestionList: async (ids: number[]) => {
    return await request.delete({ url: `/study/exercise-question/delete-list?ids=${ids.join(',')}` })
  },

  // 导出练习题 Excel
  exportExerciseQuestion: async (params) => {
    return await request.download({ url: `/study/exercise-question/export-excel`, params })
  },
}