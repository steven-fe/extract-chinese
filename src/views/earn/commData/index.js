import { getCurrencySortList } from '@/api/earn/currency-permission'
import { $t } from '@/lang/index'

export const getInvestmentCurrencyList = async() => {
  const { rows } = await getCurrencySortList(
    { pageNum: 1, pageSize: 999999 },
    { __noLoading: true }
  )
  return rows
}

export const productType = [
  { id: 0, name: $t('earn.fixedPeriod') }
]
export const productsState = [
  { id: 0, name: $t('earn.unStart') },
  { id: 1, name: $t('earn.inFundRaising') },
  { id: 2, name: $t('earn.fundRaisingFinish') },
  { id: 3, name: $t('earn.interestsCount') },
  { id: 4, name: $t('earn.wasDue') },
  { id: 5, name: $t('earn.returnedMoney') }
]
export const shelfState = [
  { id: 0, name: $t('earn.unonline') },
  { id: 1, name: $t('earn.online') }
]

export const paymentWay = [
  { id: 0, name: $t('earn.autoReturnedMoney') }
]
export const noviceExclusiveState = [
  { id: 0, name: $t('earn.no') },
  { id: 1, name: '是' }
]
export const createTypeStateMap = [
  { id: 0, name: '手动创建' },
  { id: 1, name: '自动上架任务创建' }
]

