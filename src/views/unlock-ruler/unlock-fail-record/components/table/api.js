import request from '@/utils/request'

export const executeTask = (data) => request({
  url: '/coinbull/unlock/task/execute',
  method: 'get',
  params: data
})
