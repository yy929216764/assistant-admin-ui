import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 课程知识点信息 */
export interface CourseKnowledge {
          id: number; // 知识点编号
          courseId?: number; // 课程编号
          chapterId: number; // 所属章节编号
          knowledgePointName?: string; // 知识点名称
          knowledgePointSummary: string; // 知识点摘要
          sort?: number; // 排序
  }

// 课程知识点 API
export const CourseKnowledgeApi = {
  // 查询课程知识点分页
  getCourseKnowledgePage: async (params: any) => {
    return await request.get({ url: `/study/course-knowledge/page`, params })
  },

  // 查询课程知识点详情
  getCourseKnowledge: async (id: number) => {
    return await request.get({ url: `/study/course-knowledge/get?id=` + id })
  },

  // 新增课程知识点
  createCourseKnowledge: async (data: CourseKnowledge) => {
    return await request.post({ url: `/study/course-knowledge/create`, data })
  },

  // 修改课程知识点
  updateCourseKnowledge: async (data: CourseKnowledge) => {
    return await request.put({ url: `/study/course-knowledge/update`, data })
  },

  // 删除课程知识点
  deleteCourseKnowledge: async (id: number) => {
    return await request.delete({ url: `/study/course-knowledge/delete?id=` + id })
  },

  /** 批量删除课程知识点 */
  deleteCourseKnowledgeList: async (ids: number[]) => {
    return await request.delete({ url: `/study/course-knowledge/delete-list?ids=${ids.join(',')}` })
  },

  // 导出课程知识点 Excel
  exportCourseKnowledge: async (params) => {
    return await request.download({ url: `/study/course-knowledge/export-excel`, params })
  },

  // 查询简单知识点列表（用于下拉选择）
  getSimpleKnowledgeList: async (params?: { courseId?: number; chapterId?: number }) => {
    return await request.get({ url: `/study/course-knowledge/simple-list`, params })
  },
}