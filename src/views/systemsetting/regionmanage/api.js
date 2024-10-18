import request from '@/utils/request'

export const getRegionList = data =>
  request({
    url: '/turing/setting/config/region/list',
    method: 'post',
    data
  })

export const getRegionNameList = id =>
  request({
    url: '/turing/setting/config/region/selectList',
    method: 'get',
    params: { id }
  })

export const changeState = data =>
  request({
    url: '/turing/setting/config/region/editState',
    method: 'post',
    data
  })

export const removeRegion = id =>
  request({
    url: '/turing/setting/config/region/remove',
    method: 'get',
    params: { id }
  })

export const setDefault = data =>
  request({
    url: '/turing/setting/config/region/editDefault',
    method: 'post',
    data
  })

export const setListSort = data =>
  request({
    url: '/turing/setting/config/region/sort',
    method: 'post',
    data
  })

export const add = data =>
  request({
    url: '/turing/setting/config/region/add',
    method: 'post',
    data
  })

export const getSpotSymbolList = () => {
  return request({
    url: '/turing/setting/config/symbol/symbolListV3',
    method: 'get'
  })
}

export const getDetail = id =>
  request({
    url: '/turing/setting/config/region/detail',
    method: 'get',
    params: { id }
  })

export const edit = data =>
  request({
    url: '/turing/setting/config/region/edit',
    method: 'post',
    data
  })
