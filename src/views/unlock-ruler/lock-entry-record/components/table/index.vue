<template>
  <ListTable :columns="columns" :data="data" />
</template>

<script>
import { DEFAULT_VALUE_OF_TABLE_CELL } from '@/config'
import ListTable from '@/components/list-table'
import { lockScenes, ruleStates } from '../../../data'
import single from '../../../unlock-ruler-management/components/single'

export default {
  name: 'Table',
  components: {
    ListTable
  },
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      columns: Object.freeze([
        { label: '锁仓账单ID', prop: 'id', minWidth: 120 },
        { label: 'UID', prop: 'uid', minWidth: 170 },
        { label: '入账时间', prop: 'billTime', minWidth: 170, formatter: 'formatTime' },
        { label: '币种', prop: 'currencyCode', minWidth: 80 },
        { label: '锁仓入账场景', prop: 'lockScene', minWidth: 120, formatter: ({ lockScene }) => lockScenes.mapByValue.get(lockScene).label },
        { label: '入账数量', prop: 'billQty', minWidth: 120, formatter: 'formatNumber' },
        { label: '已解锁数量', prop: 'unlockQty', minWidth: 120, formatter: 'formatNumber' },
        { label: '待解锁数量', prop: 'lockQty', minWidth: 120, formatter: 'formatNumber' },
        { label: '当前锁仓账户余额', prop: 'balance', minWidth: 140, formatter: 'formatNumber' },
        {
          label: '使用规则器ID', prop: 'ruleId', minWidth: 120,
          renderCell: (h, { row }) => {
            const { ruleId: id } = row
            return id ? h('el-link', {
              props: { type: 'primary' }, on: {
                click: () => single.open({ type: 'view', id })
              }
            }, id) : h('span', null, DEFAULT_VALUE_OF_TABLE_CELL)
          }
        },
        { label: '当前规则器状态', prop: 'ruleState', minWidth: 120, formatter: ({ ruleState }) => ruleStates.mapByValue.get(ruleState) ? ruleStates.mapByValue.get(ruleState).label : DEFAULT_VALUE_OF_TABLE_CELL }
      ])
    }
  },
  methods: {
  }
}
</script>
