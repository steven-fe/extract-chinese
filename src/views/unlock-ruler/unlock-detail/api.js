import request from '@/utils/request'

export const getUnlockDetailList = (data) => request({
  url: '/coinbull/unlock/task/list',
  method: 'post',
  data
})
