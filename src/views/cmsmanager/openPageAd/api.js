import request from '@/utils/request'

export const getList = data =>
  request({
    url: '/coinbull/setting/listStartpage',
    method: 'post',
    data
  })

export const updateState = (batchId, nextStateValue) =>
  request({
    url: '/coinbull/setting/updateStartpageState',
    method: 'post',
    data: { batchId, state: +nextStateValue }
  })

export const deleteItem = batchId =>
  request({
    url: '/coinbull/setting/delStartpage',
    method: 'post',
    data: { batchId }
  })

export const addItem = formData =>
  request({
    url: '/coinbull/setting/addStartpage',
    method: 'post',
    data: formData
  })

export const editItem = formData =>
  request({
    url: '/coinbull/setting/updateStartpage',
    method: 'post',
    data: formData
  })

export const getItem = batchId =>
  request({
    url: '/coinbull/setting/detailStartpage',
    method: 'get',
    params: { batchId }
  })
