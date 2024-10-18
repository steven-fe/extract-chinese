import { getUserListOfUserCategory, exportUserListOfUserCategory } from '@/api/user'
import Query from './components/query'
import Table from './components/table'

export default {
  name: 'UserList',
  props: {
    classId: {
      type: [Number, String, Object]
    }
  },
  data() {
    return {
      queryParams: {
        classId: this.classId,
        uid: '',
        batchNo: '',
        startTime: null,
        endTime: null,

        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      list: []
    }
  },
  methods: {
    changeQueryParams(options) {
      for (const key in options) {
        this.queryParams[key] = options[key]
      }
    },
    async getList() {
      const { rows, total } = await getUserListOfUserCategory(this.queryParams)
      this.list = rows
      this.total = total
    },
    async export() {
      const { msg } = await exportUserListOfUserCategory(this.queryParams)
      this.download(msg)
    },
    add() {
      this.$router.push({ name: 'UserCategoryBatch' })
    }
  },
  async created() {
    await this.getList()
  },
  render() {
    if (!this.classId) return null

    return <div class="app-container">
      <Query params={this.queryParams} onChange={this.changeQueryParams} onQuery={this.getList} onExport={this.export} onAdd={this.add} />

      <Table data={this.list} onUpdateList={this.getList} />

      {
        this.total > 0 &&
        (
          <Pagination
            total={this.total}
            page={this.queryParams.pageNum}
            limit={this.queryParams.pageSize}
            on={{
              'update:page': $event => this.queryParams.pageNum = $event,
              'update:limit': $event => this.queryParams.pageSize = $event
            }}
            onPagination={this.getList}
          />
        )
      }
    </div>
  }
}
