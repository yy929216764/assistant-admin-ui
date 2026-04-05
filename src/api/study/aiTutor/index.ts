import request from '@/config/axios'
import { config } from '@/config/axios/config'
import { getAccessToken } from '@/utils/auth'

export interface StudyAiConversationCreateReq {
  courseId: number
  chapterId?: number
  knowledgePointId?: number
  sceneType: number
  bizId?: number
  title?: string
}

export interface StudyAiConversation {
  id: number
  aiConversationId: number  // AI对话编号，对应 ai_chat_conversation.id
  title: string
  courseId: number
  courseName: string
  sceneType: number
  messageCount: number
  createTime: string
  updateTime?: string  // 最后更新时间（最后消息时间）
}

export interface StudyAiChatSendReq {
  conversationId: number
  content: string
  enableRag?: boolean
  topK?: number
  enableContext?: boolean
}

export interface StudyAiMessageRef {
  segmentId: number
  content: string
  documentName: string
  score: number
  sort: number
}

export interface StudyAiChatMessage {
  id?: number
  conversationId: number
  type: 'user' | 'assistant'
  content: string
  reasoningContent?: string
  refs?: StudyAiMessageRef[]
  tokens?: number
  createTime?: string
}

// 学习问答API
export const StudyAiTutorApi = {
  // 创建会话
  createConversation: async (data: StudyAiConversationCreateReq) => {
    return await request.post({ url: '/study/ai-tutor/conversation/create', data })
  },

  // 删除会话
  deleteConversation: async (id: number) => {
    return await request.delete({ url: '/study/ai-tutor/conversation/delete?id=' + id })
  },

  // 获取会话列表
  getConversationList: async (courseId?: number): Promise<StudyAiConversation[]> => {
    const res = await request.get({ url: '/study/ai-tutor/conversation/list', params: { courseId } })
    return res || []
  },

  // 发送消息（阻塞式）
  sendMessage: async (data: StudyAiChatSendReq): Promise<StudyAiChatMessage> => {
    return await request.post({ url: '/study/ai-tutor/message/send', data })
  },

  // 发送消息（流式SSE）
  sendMessageStream: async (
    data: StudyAiChatSendReq,
    onMessage: (message: StudyAiChatMessage) => void,
    onError?: (error: any) => void,
    onComplete?: () => void
  ) => {
    const token = getAccessToken()
    const response = await fetch(
      `${config.base_url}/study/ai-tutor/message/send-stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? 'Bearer ' + token : ''
        },
        body: JSON.stringify(data)
      }
    )

    if (!response.ok) {
      onError?.(new Error('请求失败'))
      return
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      onError?.(new Error('无法读取响应'))
      return
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          onComplete?.()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim()
            if (jsonStr && jsonStr !== '[DONE]') {
              try {
                const result = JSON.parse(jsonStr)
                if (result.code === 0 && result.data) {
                  onMessage(result.data)
                }
              } catch (e) {
                console.error('解析SSE消息失败', e)
              }
            }
          }
        }
      }
    } catch (error) {
      onError?.(error)
    } finally {
      reader.releaseLock()
    }
  },

  // 获取消息历史
  getMessageHistory: async (conversationId: number): Promise<StudyAiChatMessage[]> => {
    const res = await request.get({
      url: '/study/ai-tutor/message/list',
      params: { conversationId }
    })
    return res || []
  },

  // 清空会话消息
  clearMessages: async (conversationId: number) => {
    return await request.delete({
      url: '/study/ai-tutor/message/clear?conversationId=' + conversationId
    })
  }
}
