import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 课程信息 */
export interface Course {
          id: number; // 课程编号
          courseName?: string; // 课程名称
          courseCover: string; // 课程封面URL
          courseIntro: string; // 课程简介
          courseTarget: string; // 学习目标
          difficultyLevel?: number; // 难度等级 1-初级 2-中级 3-高级
          status?: number; // 状态 0-草稿 1-已发布 2-已下架
          teacherId: number; // 教师用户编号（可空，首版弱化教师角色依赖）
          aiKnowledgeId: number; // AI知识库编号，对应 ai_knowledge.id
          defaultModelId: number; // 课程默认问答模型编号，对应 ai_model.id
          sort?: number; // 排序
  }

// 课程 API
export const CourseApi = {
  // 查询课程分页
  getCoursePage: async (params: any) => {
    return await request.get({ url: `/study/course/page`, params })
  },

  // 查询课程详情
  getCourse: async (id: number) => {
    return await request.get({ url: `/study/course/get?id=` + id })
  },

  // 新增课程
  createCourse: async (data: Course) => {
    return await request.post({ url: `/study/course/create`, data })
  },

  // 修改课程
  updateCourse: async (data: Course) => {
    return await request.put({ url: `/study/course/update`, data })
  },

  // 删除课程
  deleteCourse: async (id: number) => {
    return await request.delete({ url: `/study/course/delete?id=` + id })
  },

  /** 批量删除课程 */
  deleteCourseList: async (ids: number[]) => {
    return await request.delete({ url: `/study/course/delete-list?ids=${ids.join(',')}` })
  },

  // 导出课程 Excel
  exportCourse: async (params) => {
    return await request.download({ url: `/study/course/export-excel`, params })
  },
}