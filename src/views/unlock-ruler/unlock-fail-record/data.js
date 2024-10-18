export const execStateMap = new Map([
  [0, { value: 0, type: 'notPerformed', label: '未执行' }],
  [1, { value: 1, type: 'executionSucceed', label: '执行成功' }],
  [2, { value: 2, type: 'executionFailed', label: '执行失败' }]
])
