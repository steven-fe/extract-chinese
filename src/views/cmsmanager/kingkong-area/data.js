import Vue from 'vue'
import equal from 'fast-deep-equal'
import { getLabelList } from '@/api/kingkong-area'
import { listConfig } from '@/api/system/languageconfig'

const dataFactory = (() => {
  let id = 0 // dataId

  return (getData, computeData) => {
    let inited = 0
    let done = 0
    let varName = ''

    const setData = async(_this) => {
      if (done++) return

      const { data } = await getData()
      if (!equal(_this.dynamicData[varName], data)) _this.dynamicData[varName] = data
    }

    return (_this) => {
      if (!(inited++)) (varName = `id${id++}`, _this.$set(_this.dynamicData, varName, []))

      const value = _this.dynamicData[varName]
      if (!value.length) setData(_this)

      return computeData(value)
    }
  }
})()

const reactiveData = new Vue({
  data: {
    dynamicData: {},
    labelList: new Map() // Map([ [ 1, { id: 1, name: 'ETH' } ], ... ])
  },
  computed: {
    /** Map([ [ 'en_US', { id: 'en_US', name: '英语' } ], ... ]) */
    languageMap: dataFactory(async() => ({ data: (await listConfig()).rows }), value => (new Map(value.map(({ key, language }) => ([key, { id: key, name: language }])))))
  },
  created() {
    this.updateLabelList()
  },
  methods: {
    async updateLabelList() {
      const { data } = await getLabelList()
      this.labelList = new Map(data.map(({ typeCode: id, typeName: name }) => [id, { id, name }]))
    }
  }
})

export const stateMap = new Map([[null, { id: null, name: '全部' }], [1, { id: 1, name: '上线' }], [0, { id: 0, name: '下线' }]])
export const linkTypeMap = new Map([[1, { id: 1, name: 'APP原生页' }], [2, { id: 2, name: '外部链接' }]])
export const homeFlagMap = new Map([[1, { id: 1, name: '是' }], [0, { id: 0, name: '否' }]])

export default reactiveData
