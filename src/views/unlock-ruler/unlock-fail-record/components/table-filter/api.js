import request from '@/utils/request'

export const exportTable = (data) => request({
  url: '/coinbull/unlock/task/failExportList',
  method: 'post',
  data
})
