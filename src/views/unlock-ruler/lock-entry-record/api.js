import request from '@/utils/request'

export const getLockBillList = (data) => request({
  url: '/coinbull/lock/bill/list',
  method: 'post',
  data
})
