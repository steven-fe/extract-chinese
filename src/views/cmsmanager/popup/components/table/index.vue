<template>
  <ListTable :columns="columns" :data="data" />
</template>

<script>
import { $t } from '@/lang/index'
import ListTable from '@/components/list-table'
import { Message, MessageBox } from 'element-ui'
import single from '../single'
import * as api from '../../api'
import { states, clientTypes, linkTypes, showTypes } from '../../data'

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
          minWidth: 180,
          fixed: true,
          renderCell: (h, { row }) => {
            const { batchId, status: state } = row
            const stateType = states.mapByValue.get(state).type

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
              })()
            ])
          }
        },
        { label: '弹窗广告ID', prop: 'batchId', minWidth: 160 },
        { label: $t(`['common']['title']`), prop: 'title', minWidth: 80 },
        { label: $t(`['common']['createTime']`), prop: 'createTime', minWidth: 160, formatter: 'formatTime' },
        { label: '推送时间', prop: 'triggerTime', minWidth: 160, formatter: 'formatTime' },
        {
          label: '弹窗图片', prop: 'img', minWidth: 80,
          renderCell: (h, { row }) => h('el-image', {
            style: { width: '50px', height: '50px' },
            props: { src: row.img, previewSrcList: [row.img] }
          })
        },
        { label: $t(`['common']['language']`), prop: 'languages', minWidth: 80, formatter: 'formatArray' },

        { label: $t(`['common']['jumpType']`), prop: 'linkType', minWidth: 140, formatter: ({ linkType }) => linkTypes.mapByValue.get(linkType).label },
        { label: $t(`['common']['jumpAddress']`), prop: 'url', minWidth: 180 },
        { label: $t(`['common']['clientType']`), prop: 'clientType', minWidth: 140, formatter: ({ clientType }) => clientTypes.mapByValue.get(clientType).label },
        { label: this.$t('common.status'), prop: 'state', minWidth: 80, formatter: ({ status: state }) => states.mapByValue.get(state).label },
        { label: '登录状态', prop: 'showType', minWidth: 80, formatter: ({ showType }) => showTypes.mapByValue.get(showType).label }
      ])
    }
  },
  methods: {
    edit(id) {
      single.open({ type: 'edit', id }, () => this.$emit('updateList'))
    },
    async updateState(batchId, nextStateValue, nextStateType) {
      try {
        await MessageBox.confirm(`是否确认${nextStateType === 'offline' ? '下线' : '上线'}？`, { type: 'warning' })
        await api.updateState(batchId, nextStateValue)
        Message.success('操作成功！')
        this.$emit('updateList')
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
