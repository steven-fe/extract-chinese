<template>
  <ListFilter
    :params="params"
    :items="items"
    :footer="footer"
    v-on="$listeners"
    @button-click-export="handleExport"
  />
</template>

<script>
import ListFilter from '@/components/list-filter'
import { exportTable } from './api'
import { execStateMap } from '../../data'
import { lockScenes, getOnlineCurrencies } from '../../../data'

export default {
  name: 'TableFilter',
  components: {
    ListFilter
  },
  props: {
    params: {
      type: Object,
      required: true
    },
    processFilterParamsForApi: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      currencyList: [],

      footer: Object.freeze([
        { id: 'search', type: 'primary', name: '搜索' },
        { id: 'reset', type: 'primary', name: '重置' },
        { id: 'export', type: 'primary', name: '导出' }
      ])
    }
  },
  computed: {
    items() {
      return Object.freeze([
        {
          label: '锁仓帐单ID：',
          prop: 'billId',
          component: 'textInput',
          attrs: {
            valueType: 'integer',
            trim: true,
            placeholder: '请输入'
          }
        },
        {
          label: 'UID：',
          prop: 'uid',
          component: 'textInput',
          attrs: {
            valueType: 'integer',
            trim: true,
            placeholder: '请输入'
          }
        },
        {
          label: '锁仓入账场景：',
          prop: 'lockScene',
          component: 'select',
          attrs: {
            options: lockScenes.list
          }
        },
        {
          label: '币种：',
          prop: 'currencyId',
          component: 'select',
          attrs: {
            options: this.currencyList
          }
        },
        {
          label: '规则器ID：',
          prop: 'ruleId',
          component: 'textInput',
          attrs: {
            valueType: 'integer',
            trim: true,
            placeholder: '请输入'
          }
        },
        {
          label: this.$t('frozen.resultOfEnforcement'),
          prop: 'execState',
          component: 'select',
          attrs: {
            options: [...execStateMap.values()]
          }
        },
        {
          label: '解锁时间：',
          prop: 'unlockTime',
          component: 'datePicker',
          attrs: {
          }
        }
      ])
    }
  },
  async created() {
    await this.setOptions()
  },
  methods: {
    async setOptions() {
      {
        // currencyList
        const { list } = await getOnlineCurrencies()
        this.currencyList = list
      }
    },
    async handleExport() {
      const { msg } = await exportTable(this.processFilterParamsForApi(this.params))
      this.download(msg)
    }
  }
}
</script>
