import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 错题本信息 */
export interface WrongBook {
          id: number; // 错题记录编号
          userId?: number; // 用户编号
          courseId?: number; // 课程编号
          knowledgePointId: number; // 知识点编号
          questionId?: number; // 题目编号
          exerciseId?: number; // 练习编号
          questionType: number; // 题型 1-单选 2-判断 3-简答
          questionContent: string; // 题目内容快照
          optionsJson: string; // 题目选项快照(JSON)
          correctAnswer: string; // 正确答案快照
          questionAnalysis: string; // 题目解析快照
          userAnswer: string; // 当时作答答案
          wrongCount?: number; // 错误次数
          masterStatus?: number; // 掌握状态 0-未掌握 1-已掌握
          aiAnalysis: string; // AI错因分析结果
          reviewSuggestion: string; // 复习建议
          analysisModelId: number; // 分析使用模型编号，对应 ai_model.id
          analysisConversationId: number; // 分析使用AI对话编号，对应 ai_chat_conversation.id
          analysisMessageId: number; // 分析结果消息编号，对应 ai_chat_message.id
          lastWrongTime?: string | Dayjs; // 最后错误时间
          masterTime: string | Dayjs; // 掌握时间
  }

// 错题本 API
export const WrongBookApi = {
  // 查询错题本分页
  getWrongBookPage: async (params: any) => {
    return await request.get({ url: `/study/wrong-book/page`, params })
  },

  // 查询错题本详情
  getWrongBook: async (id: number) => {
    return await request.get({ url: `/study/wrong-book/get?id=` + id })
  },

  // 新增错题本
  createWrongBook: async (data: WrongBook) => {
    return await request.post({ url: `/study/wrong-book/create`, data })
  },

  // 修改错题本
  updateWrongBook: async (data: WrongBook) => {
    return await request.put({ url: `/study/wrong-book/update`, data })
  },

  // 删除错题本
  deleteWrongBook: async (id: number) => {
    return await request.delete({ url: `/study/wrong-book/delete?id=` + id })
  },

  /** 批量删除错题本 */
  deleteWrongBookList: async (ids: number[]) => {
    return await request.delete({ url: `/study/wrong-book/delete-list?ids=${ids.join(',')}` })
  },

  // 导出错题本 Excel
  exportWrongBook: async (params) => {
    return await request.download({ url: `/study/wrong-book/export-excel`, params })
  },
}