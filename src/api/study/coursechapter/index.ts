import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 课程章节信息 */
export interface CourseChapter {
          id: number; // 章节编号
          courseId?: number; // 课程编号
          parentId?: number; // 父章节编号，0-顶级
          chapterName?: string; // 章节名称
          chapterOrder?: number; // 章节排序
          chapterLevel?: number; // 章节层级 1-章 2-节
  }

// 课程章节 API
export const CourseChapterApi = {
  // 查询课程章节分页
  getCourseChapterPage: async (params: any) => {
    return await request.get({ url: `/study/course-chapter/page`, params })
  },

  // 查询课程章节详情
  getCourseChapter: async (id: number) => {
    return await request.get({ url: `/study/course-chapter/get?id=` + id })
  },

  // 新增课程章节
  createCourseChapter: async (data: CourseChapter) => {
    return await request.post({ url: `/study/course-chapter/create`, data })
  },

  // 修改课程章节
  updateCourseChapter: async (data: CourseChapter) => {
    return await request.put({ url: `/study/course-chapter/update`, data })
  },

  // 删除课程章节
  deleteCourseChapter: async (id: number) => {
    return await request.delete({ url: `/study/course-chapter/delete?id=` + id })
  },

  /** 批量删除课程章节 */
  deleteCourseChapterList: async (ids: number[]) => {
    return await request.delete({ url: `/study/course-chapter/delete-list?ids=${ids.join(',')}` })
  },

  // 导出课程章节 Excel
  exportCourseChapter: async (params) => {
    return await request.download({ url: `/study/course-chapter/export-excel`, params })
  },

  // 查询简单课程列表（用于下拉选择）
  getSimpleCourseList: async () => {
    return await request.get({ url: `/study/course/simple-list` })
  },

  // 查询简单章节列表（用于下拉选择）
  getSimpleChapterList: async (params: { courseId: number }) => {
    return await request.get({ url: `/study/course-chapter/simple-list`, params })
  },
}