import request from '@/utils/request'

export const exportTable = (data) => request({
  url: '/coinbull/unlock/task/exportList',
  method: 'post',
  data
})
