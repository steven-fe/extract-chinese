import request from '@/utils/request'

export const exportTable = (data) => request({
  url: '/coinbull/lock/bill/exportList',
  method: 'post',
  data
})
