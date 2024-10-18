import Vue from 'vue'
import equal from 'fast-deep-equal'
import { getSpotSymbolList, getContactSymbolList } from '@/api/trading-contest'

const computedDataFactory = (() => {
  let id = 0 // dataId

  return (getData, computeData) => {
    let initialized = 0
    let done = 0
    let varName = ''

    const setData = async(_this) => {
      if (done++) return

      const { data } = await getData()
      if (!equal(_this.dynamicData[varName], data)) _this.dynamicData[varName] = data
    }

    return (_this) => {
      if (!(initialized++)) (varName = `id${id++}`, _this.$set(_this.dynamicData, varName, []))

      const value = _this.dynamicData[varName]
      if (!value.length) setData(_this)

      return computeData(value)
    }
  }
})()

const reactiveData = new Vue({
  data: {
    dynamicData: {}
  },
  computed: {
    spotSymbols: computedDataFactory(
      async() => ({ data: (await getSpotSymbolList()).data }),
      value => {
        /** Map([ [ 1, { id: 1, symbol: 'BTCUSDT', name: 'BTCUSDT' } ], ... ]) */
        const map = new Map(
          value
            .filter(({ name: symbol }) => /usdt$/i.test(symbol))
            .map(({ name: symbol }) => ([symbol, { id: symbol, name: symbol }]))
        )
        return {
          map,
          idsList: [...map.keys()],
          valuesList: [...map.values()]
        }
      }
    ),
    contractSymbols: computedDataFactory(
      async() => ({ data: (await getContactSymbolList()).rows }),
      value => {
        /** Map([ [ 1, { id: 1, symbol: 'LTCUSDT', name: 'BTC/USDT' } ], ... ]) */
        const map = new Map(
          value
            .filter(({ name: symbol }) => /usdt$/i.test(symbol))
            .map(({ name: symbol, displayName: name }) => ([symbol, { id: symbol, name }]))
        )
        return {
          map,
          idsList: [...map.keys()],
          valuesList: [...map.values()]
        }
      }
    )
  },
  created() {
  },
  methods: {
  }
})

export default reactiveData
