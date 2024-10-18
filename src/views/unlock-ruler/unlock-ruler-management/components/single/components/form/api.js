import request from '@/utils/request'
import { postFormData } from '@/utils/ruoyi'

export const addRule = (data) => request({
  url: '/coinbull/unlock/rule/add',
  method: 'post',
  data: postFormData(data)
})

export const getRule = (query) => request({
  url: '/coinbull/unlock/rule/detail',
  method: 'get',
  params: query
})

export const editRule = (data) => request({
  url: '/coinbull/unlock/rule/edit',
  method: 'post',
  data: postFormData(data)
})

export const downloadErrorExcel = (query) => request({
  url: '/coinbull/unlock/rule/exportFail',
  method: 'get',
  params: query
})
