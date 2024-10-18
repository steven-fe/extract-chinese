import { instance as editUserCategory } from '@/views/usermanage/user-category/components/edit-user-category'
import removeUserCategory from '@/views/usermanage/user-category/components/remove-user-category'

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
        width="100"
        scopedSlots={{
          default: ({ row }) => {
            return (
              <div>
                <el-button
                  type="text"
                  size="mini"
                  onClick={editUserCategory.open.bind(editUserCategory, row, this.$emit.bind(this, 'updateList'))}
                >修改</el-button>
                <el-button
                  type="text"
                  size="mini"
                  onClick={removeUserCategory.bind(null, { classId: row.classId, uid: row.uid }, this.$emit.bind(this, 'updateList'))}
                >删除</el-button>
              </div>
            )
          }
        }}
      />

      <el-table-column prop="userId" label="UserId" />

      <el-table-column prop="uid" label="用户UID" />

      <el-table-column prop="batchDesc" label="添加说明" />

      <el-table-column prop="createdAt" label="添加时间" formatter={({ createdAt }) => this.parseTime(createdAt)} />

    </el-table>
  }
}
