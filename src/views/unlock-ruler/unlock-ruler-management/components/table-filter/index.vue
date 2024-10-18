<template>
  <ListFilter
    :params="params"
    :items="items"
    :footer="footer"
    v-on="$listeners"
    @button-click-create="createSingle"
  />
</template>

<script>
import ListFilter from '@/components/list-filter'
import single from '../single'
import { lockScenes, ruleStates, unlockWays } from '../../../data'
import { getOnlineCurrencies } from '../../../data'

export default {
  name: 'TableFilter',
  components: {
    ListFilter
  },
  props: {
    params: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currencyList: [],

      footer: Object.freeze([
        { id: 'search', type: 'primary', name: '搜索' },
        { id: 'reset', type: 'primary', name: '重置' },
        { id: 'create', type: 'primary', name: '新增规则器' }
      ])
    }
  },
  computed: {
    items() {
      return Object.freeze([
        {
          label: '解锁币种：',
          prop: 'currencyId',
          component: 'select',
          attrs: {
            options: this.currencyList
          }
        },
        Object.freeze({
          label: '锁仓入账场景：',
          prop: 'lockScene',
          component: 'select',
          attrs: {
            options: lockScenes.list
          }
        }),
        Object.freeze({
          label: '解锁方式：',
          prop: 'unlockWay',
          component: 'select',
          attrs: {
            options: unlockWays.list
          }
        }),
        Object.freeze({
          label: '规则器状态：',
          prop: 'ruleState',
          component: 'select',
          attrs: {
            options: ruleStates.list
          }
        })
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
    createSingle() {
      single.open({ type: 'create' }, () => this.$emit('button-click-search'))
    }
  }
}
</script>
