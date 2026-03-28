import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 学习场景与AI对话映射信息 */
export interface AiConversationRef {
          id: number; // 编号
          conversationId?: number; // AI对话编号，对应 ai_chat_conversation.id
          userId?: number; // 用户编号
          courseId: number; // 课程编号
          chapterId: number; // 章节编号
          knowledgePointId: number; // 知识点编号
          aiKnowledgeId: number; // 知识库编号，对应 ai_knowledge.id
          sceneType?: number; // 场景类型 1-课程问答 2-错题分析 3-练习生成
          bizId: number; // 业务编号，按场景存放错题编号或练习编号等
          status?: number; // 状态 0-关闭 1-有效
  }

// 学习场景与AI对话映射 API
export const AiConversationRefApi = {
  // 查询学习场景与AI对话映射分页
  getAiConversationRefPage: async (params: any) => {
    return await request.get({ url: `/study/ai-conversation-ref/page`, params })
  },

  // 查询学习场景与AI对话映射详情
  getAiConversationRef: async (id: number) => {
    return await request.get({ url: `/study/ai-conversation-ref/get?id=` + id })
  },

  // 新增学习场景与AI对话映射
  createAiConversationRef: async (data: AiConversationRef) => {
    return await request.post({ url: `/study/ai-conversation-ref/create`, data })
  },

  // 修改学习场景与AI对话映射
  updateAiConversationRef: async (data: AiConversationRef) => {
    return await request.put({ url: `/study/ai-conversation-ref/update`, data })
  },

  // 删除学习场景与AI对话映射
  deleteAiConversationRef: async (id: number) => {
    return await request.delete({ url: `/study/ai-conversation-ref/delete?id=` + id })
  },

  /** 批量删除学习场景与AI对话映射 */
  deleteAiConversationRefList: async (ids: number[]) => {
    return await request.delete({ url: `/study/ai-conversation-ref/delete-list?ids=${ids.join(',')}` })
  },

  // 导出学习场景与AI对话映射 Excel
  exportAiConversationRef: async (params) => {
    return await request.download({ url: `/study/ai-conversation-ref/export-excel`, params })
  },
}