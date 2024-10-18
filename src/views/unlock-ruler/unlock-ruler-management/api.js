import request from '@/utils/request'

export const getUnlockRuleList = (data) => request({
  url: '/coinbull/unlock/rule/list',
  method: 'post',
  data
})

export const operateState = (id, nextState = 'close') => request({
  url: '/coinbull/unlock/rule/operateState',
  method: 'get',
  params: {
    id,
    state: new Map([['close', { type: 'close', value: 0 }], ['open', { type: 'open', value: 1 }]]).get(nextState)
      .value
  }
})
