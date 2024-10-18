import { getAllUserCategoryList as getAllUserCategoryListApi } from '@/api/user'

export const getAllUserCategoryList = (() => {
  let list = null

  return async() => {
    if (!list) {
      const { rows } = await getAllUserCategoryListApi()
      list = rows
    }

    return list
  }
})()
