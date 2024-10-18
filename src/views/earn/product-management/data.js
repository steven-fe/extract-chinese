import Vue from 'vue'
import { getCurrencySortList as getCurrencyList } from '@/api/earn/currency-permission'
import { listConfig } from '@/api/system/languageconfig'
import { $t } from '@/lang/index'

const dataFactory = (() => {
  let id = 0 // dataId

  return (getData, computeData, cache = true) => {
    let inited = 0
    let done = 0
    let varName = ''
    let timestamp = 0

    const setData = async(_this) => {
      if (cache && done++) return

      const now = Date.now()
      if (now - timestamp < 3000) return
      timestamp = now

      const { data } = await getData()
      if (JSON.stringify(_this.dynamicData[varName]) !== JSON.stringify(data)) {
        _this.dynamicData[varName] = data
      }
    }

    return {
      cache,
      get: (_this) => {
        if (!inited++) {
          varName = `id${id++}`
          _this.$set(_this.dynamicData, varName, [])
        }

        const value = _this.dynamicData[varName]
        if (!cache || !value.length) setData(_this)

        return computeData(value)
      }
    }
  }
})()

const reactiveData = new Vue({
  data: {
    dynamicData: {}
  },
  computed: {
    /** Map([ [ 'ETH', { id: 'ETH', name: 'ETH' } ], ... ]) */
    currencyMap: dataFactory(
      async() => ({
        data: (await getCurrencyList(
          { pageNum: 1, pageSize: 999999 },
          { __noLoading: true }
        )).rows
      }),
      (value) =>
        new Map(value.map(({ fcurrency: name }) => [name, { id: name, name }])),
      false
    ),
    /** Map([ [ 'en_US', { id: 'en_US', name: '英语' } ], ... ]) */
    languageMap: dataFactory(
      async() => ({ data: (await listConfig()).rows }),
      (value) =>
        new Map(
          value.map(({ key, language }) => [key, { id: key, name: language }])
        )
    )
  }
})

export const typeMap = new Map([[0, { id: 0, name: $t('earn.fixedPeriod'), key: 0 }]])
export const productsStateMap = new Map([
  [0, { id: 0, name: $t('earn.unStart'), key: 1 }],
  [1, { id: 1, name: $t('earn.inFundRaising'), key: 2 }],
  [2, { id: 2, name: $t('earn.fundRaisingFinish'), key: 3 }],
  [3, { id: 3, name: $t('earn.interestsCount'), key: 4 }],
  [4, { id: 4, name: $t('earn.wasDue'), key: 5 }],
  [5, { id: 5, name: $t('earn.returnedMoney'), key: 6 }]
])
export const shelfStateMap = new Map([
  [0, { id: 0, name: $t('earn.unonline'), key: 7 }],
  [1, { id: 1, name: $t('earn.online'), key: 8 }],
  [2, { id: 2, name: '已下架', key: 9 }]
])
export const paymentWayMap = new Map([[0, { id: 0, name: $t('earn.autoReturnedMoney'), key: 10 }]])
export const noviceExclusiveStateMap = new Map([
  [0, { id: 0, name: '否', key: 11 }],
  [1, { id: 1, name: '是', key: 12 }]
])
export const createTypeStateMap = new Map([
  [0, { id: 0, name: '手动创建', key: 13 }],
  [1, { id: 1, name: '自动上架任务创建', key: 14 }]
])

export const tableOptions = {
  border: true
}
export default reactiveData
