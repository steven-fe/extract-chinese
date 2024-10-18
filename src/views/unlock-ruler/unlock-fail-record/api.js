import request from '@/utils/request'

export const getUnlockDetailList = (data) => request({
  url: '/coinbull/unlock/task/failList',
  method: 'post',
  data
})
