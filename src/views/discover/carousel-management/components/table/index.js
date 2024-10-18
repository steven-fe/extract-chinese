import { del, changeState } from '@/api/discover/carousel'
import { Message, MessageBox } from 'element-ui'
import $data, { stateMap } from '../../data'
import single from '../single'

export default {
  name: 'Table',
  props: {
    data: {
      type: Array
    }
  },
  render() {
    return <el-table data={this.data} border>
      <el-table-column
        prop="operation"
        label="操作"
        width="220"
        fixed
        align="center"
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
                          await MessageBox.confirm(`确定${nextStateText}该项目？`, { type: 'warning' })
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
                  type="danger"
                  size="mini"
                  onClick={async() => {
                    try {
                      await MessageBox.confirm('确定删除该项目？', { type: 'warning' })
                      await del({ id })
                      Message.success('操作成功！')
                      this.$emit('updateList')
                    } catch (e) {
                      console.log(e)
                    }
                  }}
                >删除</el-button>
              </div>
            )
          }
        }}
      />

      <el-table-column prop="title" label="标题" align="center" />

      <el-table-column
        prop="picture"
        label="图片"
        width="160"
        align="center"
        scopedSlots={{
          default: ({ row }) => <div style="display:flex;justify-content:center;align-items:center;">
            { !!row.appPicture && <img style="width: 70px; height: 24px;" src={row.appPicture} /> }
            &nbsp;&nbsp;
            { !!row.webPicture && <img style="width: 70px; height: 13px;" src={row.webPicture} /> }
          </div>
        }}
      />

      <el-table-column prop="linkAdd" label="跳转链接" align="center" />

      <el-table-column prop="language" label="语言" align="center" formatter={({ language }) => language.split(',').map(languageId => ($data.languages.map.get(languageId) || {}).name).join(',')} />

      <el-table-column prop="state" label="状态" width="80" align="center" formatter={({ state }) => stateMap.get(state).name} />

      <el-table-column prop="clientType" label="客户端类型" width="180" align="center" />

      <el-table-column prop="weight" label="排序权重" width="80" align="center" />
    </el-table>
  }
}
