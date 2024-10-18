import request from '@/utils/request'

export const getOnlineCurrencies = () => request({
  url: '/turing/setting/config/symbol/currencyOnlineList',
  method: 'get'
})
