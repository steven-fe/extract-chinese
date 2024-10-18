import { getOnlineCurrencies as getOnlineCurrenciesApi } from './api'
import { createDataCombination } from '@/utils/data'

export const lockScenes = createDataCombination([
  { value: 2, type: 'launchpad', label: 'Launchpad锁仓' },
  { value: 3, type: 'airdrop', label: '空投锁仓' },
  { value: 1, type: 'recharge', label: '充值锁仓' },
  { value: 4, type: 'balance', label: '余额锁仓' }
])

export const ruleStates = createDataCombination([
  { value: 0, type: 'unopened', label: '未开启' },
  { value: 1, type: 'inprogress', label: '进行中' },
  { value: 2, type: 'completed', label: '已完成' },
  { value: 3, type: 'closed', label: '已关闭' }
])

export const whether = createDataCombination([
  { value: 1, type: 'yes', label: '是' },
  { value: 0, type: 'no', label: '否' }
])

export const unlockWays = createDataCombination([
  { value: 1, type: 'fixedPercentage', label: '固定百分比' }
])

export const getOnlineCurrencies = async() => {
  const { data: currencyList } = await getOnlineCurrenciesApi()
  return createDataCombination(currencyList.map(({ id: value, name: type, name: label }) => ({ value, type, label })))
}
