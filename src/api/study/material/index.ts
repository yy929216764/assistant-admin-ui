import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 学习资料信息 */
export interface Material {
          id: number; // 资料编号
          materialName?: string; // 资料名称
          materialType?: number; // 资料类型 1-PDF 2-Word 3-Markdown 4-文本 5-视频 6-其他
          fileUrl?: string; // 文件URL
          fileSize: number; // 文件大小(字节)
          courseId: number; // 关联课程编号
          chapterId: number; // 关联章节编号
          knowledgePointId: number; // 关联知识点编号
          aiKnowledgeId: number; // 目标AI知识库编号，对应 ai_knowledge.id
          aiDocumentId: number; // AI知识库文档编号，对应 ai_knowledge_document.id
          syncStatus?: number; // 知识库同步状态 0-待同步 1-同步中 2-成功 3-失败
          syncErrorMsg: string; // 同步失败原因
          syncTime: string | Dayjs; // 最近同步时间
          uploadUserId?: number; // 上传用户编号
  }

// 学习资料 API
export const MaterialApi = {
  // 查询学习资料分页
  getMaterialPage: async (params: any) => {
    return await request.get({ url: `/study/material/page`, params })
  },

  // 查询学习资料详情
  getMaterial: async (id: number) => {
    return await request.get({ url: `/study/material/get?id=` + id })
  },

  // 新增学习资料
  createMaterial: async (data: Material) => {
    return await request.post({ url: `/study/material/create`, data })
  },

  // 修改学习资料
  updateMaterial: async (data: Material) => {
    return await request.put({ url: `/study/material/update`, data })
  },

  // 删除学习资料
  deleteMaterial: async (id: number) => {
    return await request.delete({ url: `/study/material/delete?id=` + id })
  },

  /** 批量删除学习资料 */
  deleteMaterialList: async (ids: number[]) => {
    return await request.delete({ url: `/study/material/delete-list?ids=${ids.join(',')}` })
  },

  // 导出学习资料 Excel
  exportMaterial: async (params) => {
    return await request.download({ url: `/study/material/export-excel`, params })
  },

  // 同步资料到知识库
  syncToKnowledge: async (id: number) => {
    return await request.post({ url: `/study/material/sync-to-knowledge?id=` + id })
  },

  // 批量同步资料到知识库
  syncListToKnowledge: async (ids: number[]) => {
    return await request.post({ url: `/study/material/sync-list-to-knowledge?ids=${ids.join(',')}` })
  },
}