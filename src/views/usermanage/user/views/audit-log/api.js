import request from '@/utils/request'

export const getLogList = params =>
  request({
    url: '/coinbull/user/review/list',
    method: 'post',
    data: params
  })

export const exportList = params =>
  request({
    url: '/coinbull/user/review/export',
    method: 'post',
    data: params
  })
