<template>
  <ListTable :columns="columns" :data="data" />
</template>

<script>
import { $t } from '@/lang/index'
import ListTable from '@/components/list-table'
import { Message, MessageBox } from 'element-ui'
import single from '../single'
import * as api from '../../api'
import { states, clientTypes } from '../../data'

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
          label: $t(`['common']['operation']`),
          prop: 'operation',
          minWidth: 240,
          fixed: true,
          renderCell: (h, { row }) => {
            const { batchId, state } = row
            const stateType = states.mapByValue.get(String(state)).type

            return h('div', {}, [
              h('el-button', {
                props: { type: 'primary', size: 'mini' },
                on: {
                  click: this.edit.bind(this, batchId)
                }
              }, $t(`['common']['modify']`)),

              (() => {
                const nextStateType = stateType === 'online' ? 'offline' : 'online'
                const { value: nextStateValue, label: nextStateLabel } = states.mapByType.get(nextStateType)
                return h('el-button', {
                  props: { type: nextStateType === 'offline' ? 'danger' : 'success', size: 'mini' },
                  on: {
                    click: this.updateState.bind(this, batchId, nextStateValue, nextStateType, nextStateLabel)
                  }
                }, nextStateLabel)
              })(),

              h('el-button', {
                props: { type: 'danger', size: 'mini' },
                on: {
                  click: this.delete.bind(this, batchId)
                }
              }, $t(`['common']['delete']`))
            ])
          }
        },
        { label: '开屏广告ID', prop: 'batchId', minWidth: 160 },
        { label: $t(`['common']['title']`), prop: 'title', minWidth: 80 },
        {
          label: $t(`['common']['picture']`), prop: 'img', minWidth: 80,
          renderCell: (h, { row }) => h('el-image', {
            style: { width: '50px', height: '50px' },
            props: { src: row.img, previewSrcList: [row.img] }
          })
        },
        { label: $t(`['common']['jump']`), prop: 'url', minWidth: 180 },
        { label: $t(`['common']['clientType']`), prop: 'clientType', minWidth: 140, formatter: ({ clientType }) => clientTypes.mapByValue.get(clientType).label },
        { label: $t(`['common']['language']`), prop: 'languages', minWidth: 120, formatter: 'formatArray' },
        { label: $t(`['common']['adStatus']`), prop: 'state', minWidth: 80, formatter: ({ state }) => states.mapByValue.get(String(state)).label },
        { label: $t(`['common']['addTime']`), prop: 'createdTime', minWidth: 160, formatter: 'formatTime' }
      ])
    }
  },
  methods: {
    edit(id) {
      single.open({ type: 'edit', id }, () => this.$emit('updateList'))
    },
    async updateState(batchId, nextStateValue, nextStateType) {
      try {
        const msg = nextStateType === 'offline' ? '下线后将不再对用户展示该广告，确认下线？' : '上线后将对用户展示该广告，确认上线？同一语种和客户端类型的已上线广告，也会被顶替掉。'
        await MessageBox.confirm(msg, { type: 'warning' })
        await api.updateState(batchId, nextStateValue)
        Message.success('操作成功！')
        this.$emit('updateList')
      } catch (e) {
        console.error(e)
      }
    },
    async delete(batchId) {
      try {
        await MessageBox.confirm($t(`['common']['continueDelete1']`), { type: 'warning' })
        await api.deleteItem(batchId)
        Message.success('操作成功！')
        this.$emit('updateList')
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
