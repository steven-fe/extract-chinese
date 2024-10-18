import request from '@/utils/request'

export const getBasicShowName = (symbol) => request({
  url: '/turing/setting/config/symbol/basicShowName',
  method: 'get',
  params: { symbol }
})
