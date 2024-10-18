import { createDataCombination } from '@/utils/data'

export const ruleTypes = createDataCombination([
  { value: 1, type: 'notAccountedFor', label: '未入账代币解锁' },
  { value: 2, type: 'alreadyAccountedFor', label: '已入账代币解锁' }
])

export const unlockFirstTypes = createDataCombination([
  { value: 1, type: 'unifiedTime', label: '统一时间' },
  { value: 2, type: 'timeInterval', label: '距入账时间间隔' }
])
