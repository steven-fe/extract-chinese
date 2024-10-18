import { changeState, del, changeHomeFlag } from '@/api/kingkong-area'
import { Message, MessageBox } from 'element-ui'
import $data, { stateMap, linkTypeMap } from '../../data'
import single from '../single'

export default {
  name: 'Table',
  props: {
    data: {
      type: Array
    }
  },
  render() {
    const languageMap = $data.languageMap

    return <el-table data={this.data} border align="center">
      <el-table-column
        prop="operation"
        label="操作"
        width="280"
        fixed
        scopedSlots={{
          default: ({ row }) => {
            const { id, state } = row

            return (
              <div>
                <el-button type="primary" size="mini" onClick={() => single.open({ id, type: 'edit' }, () => this.$emit('updateList'))}>修改</el-button>

                {
                  (() => {
                    const nextState = +!state
                    const nextStateText = stateMap.get(nextState).name

                    return <el-button
                      type={nextState ? 'success' : 'danger'}
                      size="mini"
                      onClick={async() => {
                        try {
                          await MessageBox.confirm(
                            `确定${nextStateText}？`,
                            {
                              type: 'warning',
                              confirmButtonText: this.$t('common.sure'),
                              cancelButtonText: '取消'
                            }
                          )

                          await changeState({ id, state: nextState })
                          Message.success('操作成功！')
                          this.$emit('updateList')
                        } catch (e) {
                          console.log(e)
                        }
                      }}
                    >{ nextStateText }</el-button>
                  })()
                }

                <el-button
                  type="primary"
                  size="mini"
                  onClick={async() => {
                    try {
                      await MessageBox.confirm(
                        '确定删除？',
                        {
                          type: 'warning',
                          confirmButtonText: '确定',
                          cancelButtonText: '取消'
                        }
                      )
                      await del({ id })
                      Message.success('操作成功！')
                      this.$emit('updateList')
                    } catch (e) {
                      console.log(e)
                    }
                  }}>删除</el-button>
              </div>
            )
          }
        }}
      />

      <el-table-column prop="title" label="名称" />

      <el-table-column
        prop="homeFlag"
        label="是否默认首页"
        width="100"
        scopedSlots={{
          default: ({ row }) => <el-switch
            value={!!row.homeFlag}
            onChange={async(newHomeFlag) => {
              await changeHomeFlag({ id: row.id, homeFlag: +newHomeFlag })
              this.$emit('updateList')
            }}
          />
        }}
      />

      <el-table-column
        prop="iconAddress"
        label="icon"
        width="80"
        scopedSlots={{
          default: ({ row }) => <img style="width: 40px; height: 40px;" src={row.iconAddress} />
        }}
      />

      <el-table-column prop="linkType" label="跳转类型" width="120" formatter={({ linkType }) => linkTypeMap.get(linkType).name} />

      <el-table-column prop="linkAdd" label="跳转链接" width="180" />

      <el-table-column prop="language" label="语言" width="150" formatter={({ language }) => (language || '').split(',').map(languageId => (languageMap.get(languageId) ? languageMap.get(languageId).name : '')).join(', ')} />

      <el-table-column prop="typeName" label="类型" width="80" />

      <el-table-column prop="state" label="状态" width="100" formatter={({ state }) => stateMap.get(state).name} />

      <el-table-column prop="weight" label="权重" width="100" />

    </el-table>
  }
}
