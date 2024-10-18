import request from '@/utils/request'

export const exportList = data =>
  request({
    url: '/coinbull/financial/order/export',
    method: 'post',
    data
  })
