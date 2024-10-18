<template>
  <ListTable :columns="columns" :data="data" />
</template>

<script>
import ListTable from '@/components/list-table'
import { Message } from 'element-ui'
import single from '../../../unlock-ruler-management/components/single'
import { execStateMap } from '../../data'
import { executeTask } from './api'

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
        {
          label: '操作',
          prop: 'operation',
          minWidth: 140,
          fixed: true,
          renderCell: (h, { row }) => {
            return h('el-button',
              {
                props: {
                  type: 'primary',
                  size: 'mini',
                  disabled: ['executionSucceed'].includes(execStateMap.get(row.execState).type)
                },
                on: {
                  click: async() => {
                    await executeTask({ id: row.id })
                    Message.success('操作成功！')
                    this.$emit('updateList')
                  }
                }
              },
              '手动执行'
            )
          }
        },
        { label: '解锁时间', prop: 'unlockTime', minWidth: 170, formatter: 'formatTime' },
        { label: '锁仓账单ID', prop: 'billId', minWidth: 120 },
        { label: 'UID', prop: 'uid', minWidth: 170 },
        { label: '币种', prop: 'currencyCode', minWidth: 80 },
        { label: '本次解锁量', prop: 'unlockQty', minWidth: 140, formatter: 'formatNumber' },
        {
          label: '使用规则器ID',
          prop: 'ruleId',
          minWidth: 120,
          renderCell: (h, { row }) => {
            const { ruleId: id } = row
            return h('el-link', { props: { type: 'primary' }, on: {
              click: () => single.open({ type: 'view', id })
            }}, id)
          }
        },
        { label: this.$t('financemanager.causeOfFailure'), prop: 'failContent', minWidth: 120 },
        { label: '手动执行结果', prop: 'execState', minWidth: 120, formatter: ({ execState }) => execStateMap.get(execState).label }
      ])
    }
  },
  methods: {
  }
}
</script>
