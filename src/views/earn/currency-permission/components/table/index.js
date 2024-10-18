import { deleteCurrencySort } from '@/api/earn/currency-permission'
import { Message, MessageBox } from 'element-ui'
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
        width="200"
        scopedSlots={{
          default: ({ row }) => {
            const { fid } = row

            return (
              <div>
                <el-button
                  type="text"
                  size="mini"
                  onClick={async() => {
                    try {
                      await MessageBox.confirm('移除后该币种后，新增理财产品时将无法再选择该币种。', '确认移除该理财币种？', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                      })
                      await deleteCurrencySort(fid)
                      Message.success('操作成功！')
                      this.$emit('updateList')
                    } catch (e) {
                      console.log(e)
                    }
                  }}
                >移除</el-button>

                <el-button type="text" size="mini" onClick={() => single.open({ id: fid, type: 'edit' }, () => this.$emit('updateList'))}>修改</el-button>
              </div>
            )
          }
        }}
      />

      <el-table-column prop="fsort" label="排序权重" />

      <el-table-column prop="fcurrency" label="币种代码" />

    </el-table>
  }
}
