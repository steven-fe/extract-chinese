import { removeUserCategory } from '@/api/user'

export default {
  name: 'Table',
  props: {
    data: {
      type: Array
    }
  },
  methods: {
    edit(id) {
      this.$router.push({ name: 'userCategoryEdit', query: { id }})
    },
    viewDetail(id) {
      this.$router.push({ name: 'userCategoryDetail', query: { id }})
    },
    copy(id) {
      this.$router.push({ name: 'userCategoryCopy', query: { id }})
    },
    async remove(id) {
      try {
        await this.$confirm('删除后该分类下的用户，将不再拥有分类用户专属的配置。', '确认删除该用户分类？', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await removeUserCategory(id)
        this.$emit('updateList')
      } catch (e) {
        console.error(e)
      }
    }
  },
  render() {
    return <el-table data={this.data} border>
      <el-table-column prop="className" label="用户分类名称" width="150" />

      <el-table-column prop="classCode" label="用户分类ID" width="200" />

      <el-table-column prop="classDesc" label="分类说明" />

      <el-table-column
        prop="userCount"
        label="分类用户总数"
        width="150"
        scopedSlots={{
          default: scope => <el-link type="primary" underline={false} onClick={() => this.$router.push({ name: 'userCategoryDetail', query: { id: scope.row.id, curTabName: 'categoryUserList' }})} >{scope.row.userCount}</el-link>
        }}
      />

      <el-table-column
        prop="createdAt"
        label="创建时间"
        width="180"
        scopedSlots={{
          default: scope => (this.parseTime(scope.row.createdAt))
        }}
      />

      <el-table-column
        prop="operation"
        label="操作"
        width="320"
        scopedSlots={{
          default: scope => {
            const { id } = scope.row

            return (
              <div>
                <el-button size="mini" onClick={this.edit.bind(this, id)}>编辑</el-button>
                <el-button type="warning" size="mini" onClick={this.viewDetail.bind(this, id)}>详情</el-button>
                <el-button type="success" size="mini" onClick={this.copy.bind(this, id)}>复制</el-button>
                <el-button type="danger" size="mini" onClick={this.remove.bind(this, id)}>删除</el-button>
              </div>
            )
          }
        }}
      />
    </el-table>
  }
}
