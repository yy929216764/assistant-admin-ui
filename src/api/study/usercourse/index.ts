import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户课程学习关系信息 */
export interface UserCourse {
          id: number; // 编号
          userId?: number; // 用户编号
          courseId?: number; // 课程编号
          enrollStatus?: number; // 状态 1-学习中 2-已完成 3-已放弃
          progressPercent?: number; // 学习进度百分比
          lastStudyTime: string | Dayjs; // 最后学习时间
          completeTime: string | Dayjs; // 完成时间
  }

// 用户课程学习关系 API
export const UserCourseApi = {
  // 查询用户课程学习关系分页
  getUserCoursePage: async (params: any) => {
    return await request.get({ url: `/study/user-course/page`, params })
  },

  // 查询用户课程学习关系详情
  getUserCourse: async (id: number) => {
    return await request.get({ url: `/study/user-course/get?id=` + id })
  },

  // 新增用户课程学习关系
  createUserCourse: async (data: UserCourse) => {
    return await request.post({ url: `/study/user-course/create`, data })
  },

  // 修改用户课程学习关系
  updateUserCourse: async (data: UserCourse) => {
    return await request.put({ url: `/study/user-course/update`, data })
  },

  // 删除用户课程学习关系
  deleteUserCourse: async (id: number) => {
    return await request.delete({ url: `/study/user-course/delete?id=` + id })
  },

  /** 批量删除用户课程学习关系 */
  deleteUserCourseList: async (ids: number[]) => {
    return await request.delete({ url: `/study/user-course/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户课程学习关系 Excel
  exportUserCourse: async (params) => {
    return await request.download({ url: `/study/user-course/export-excel`, params })
  },
}