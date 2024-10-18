import request from '@/utils/request'

export const getList = data =>
  request({
    url: '/coinbull/popupad/list',
    method: 'post',
    data
  })

export const updateState = (batchId, nextStateValue) =>
  request({
    url: '/coinbull/popupad/updateState',
    method: 'post',
    data: { batchId, state: +nextStateValue }
  })

export const addItem = formData =>
  request({
    url: '/coinbull/popupad/add',
    method: 'post',
    data: formData
  })

export const editItem = formData =>
  request({
    url: '/coinbull/popupad/edit',
    method: 'post',
    data: formData
  })

export const getItem = batchId =>
  request({
    url: '/coinbull/popupad/info',
    method: 'get',
    params: { batchId }
  })
