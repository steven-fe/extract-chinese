import { del, changeState } from '@/api/discover/management'
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

      <el-table-column prop="title" label="项目名称" align="center" />

      <el-table-column prop="introduction" label="描述" width="210" align="center" />

      <el-table-column
        prop="icon"
        label="Logo"
        width="80"
        align="center"
        scopedSlots={{
          default: ({ row }) => <img style="width: 40px; height: 40px;" src={row.icon} />
        }}
      />

      <el-table-column prop="url" label="跳转链接" width="200" align="center" formatter={({ url, urlApplet }) => url || urlApplet} />

      <el-table-column prop="language" label="语言" width="150" align="center" formatter={({ language }) => language.split(',').map(languageId => ($data.languages.map.get(languageId) || {}).name).join(',')} />

      <el-table-column
        prop="label"
        label="标签"
        width="150"
        align="center"
        scopedSlots={{
          default: ({ row }) => <ul style="list-style:none;padding:0;display:inline-flex;flex-wrap:wrap;margin:0 -5px -5px 0;">
            {
              (row.label || []).map((text, index) => <li key={index} style="margin: 0 5px 5px 0;">
                <el-tag>{text}</el-tag>
              </li>)
            }
          </ul>
        }}
      />

      <el-table-column prop="weight" label="排序权重" width="80" align="center" />

      <el-table-column prop="state" label="上线状态" width="80" align="center" formatter={({ state }) => stateMap.get(state).name} />

    </el-table>
  }
}
