import Vue from 'vue'
import equal from 'fast-deep-equal'
import { listConfig } from '@/api/system/languageconfig'

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
    languages: computedDataFactory(
      async() => ({ data: (await listConfig()).rows }),
      value => {
        /** Map([ [ 'en_US', { id: 'en_US', name: '英语' } ], ... ]) */
        const map = new Map(value.map(({ key, language }) => ([key, { id: key, name: language }])))
        return {
          map,
          idsList: [...map.keys()],
          valuesList: [...map.values()]
        }
      }
    ),
    /** Map([ [ 'en_US', { id: 'en_US', name: '英语' } ], ... ]) */
    languageMap: computedDataFactory(
      async() => ({ data: (await listConfig()).rows }),
      value => (new Map(value.map(({ key, language }) => ([key, { id: key, name: language }]))))
    )
  },
  created() {
  },
  methods: {
  }
})

export default reactiveData

export const stateMap = new Map([[1, { id: 1, name: '上线' }], [0, { id: 0, name: '下线' }]])
