<template>
  <ListTable :columns="columns" :data="data" />
</template>

<script>
import ListTable from '@/components/list-table'
import { Message, MessageBox } from 'element-ui'
import { DEFAULT_VALUE_OF_TABLE_CELL } from '@/config'
import single from '../single'
import { operateState } from '../../api'
import { lockScenes, ruleStates, unlockWays } from '../../../data'

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
          minWidth: 240,
          fixed: true,
          renderCell: (h, { row }) => {
            const { id, ruleState } = row
            const ruleStateType = ruleStates.mapByValue.get(ruleState).type
            return h('div', {}, [
              h('el-button', {
                props: { type: 'primary', size: 'mini' },
                on: {
                  click: this.view.bind(this, id)
                }
              }, '查看'),
              h('el-button', {
                props: { type: 'primary', size: 'mini', disabled: ruleStateType !== 'unopened' },
                on: {
                  click: this.edit.bind(this, id)
                }
              }, '修改'),
              (() => {
                const nextState = ruleStateType === 'unopened' ? 'open' : 'close'
                const nextStateText = nextState === 'close' ? '关闭' : '开启'
                return h('el-button', {
                  props: { type: nextState === 'close' ? 'danger' : 'success', size: 'mini', disabled: !['unopened', 'inprogress'].includes(ruleStateType) },
                  on: {
                    click: this.close.bind(this, id, nextState, nextStateText)
                  }
                }, nextStateText)
              })()
            ])
          }
        },
        { label: '规则器ID', prop: 'id', minWidth: 80 },
        { label: '备注名', prop: 'remarks', minWidth: 80 },
        { label: '解锁币种', prop: 'currencyCode', minWidth: 80 },
        { label: '锁仓入账场景', prop: 'lockScene', minWidth: 150, formatter: ({ lockScene }) => [null, undefined].includes(lockScene) ? DEFAULT_VALUE_OF_TABLE_CELL : lockScenes.mapByValue.get(lockScene).label },
        { label: '解锁方式', prop: 'unlockWay', minWidth: 120, formatter: ({ unlockWay }) => unlockWays.mapByValue.get(unlockWay).label },
        { label: '入账开始时间', prop: 'startTime', minWidth: 170, formatter: 'formatTime' },
        { label: '入账结束时间', prop: 'endTime', minWidth: 170, formatter: 'formatTime' },
        { label: '规则器状态', prop: 'ruleState', minWidth: 120, formatter: ({ ruleState }) => ruleStates.mapByValue.get(ruleState).label }
      ])
    }
  },
  methods: {
    view(id) {
      single.open({ type: 'view', id })
    },
    edit(id) {
      single.open({ type: 'edit', id }, () => this.$emit('updateList'))
    },
    async close(id, nextState, nextStateText) {
      try {
        await MessageBox.confirm(`确定要${nextStateText}该规则器吗？`, { type: 'warning' })
        await operateState(id, nextState)
        Message.success('操作成功！')
        this.$emit('updateList')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
