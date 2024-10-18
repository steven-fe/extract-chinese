import { getUserCategoryList } from '@/api/user'
import Query from './components/query'
import Table from './components/table'

export default {
  name: 'List',
  data() {
    return {
      queryParams: {
        name: '',
        startTime: null,
        endTime: null,

        pageNum: 1,
        pageSize: 20
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
    async query() {
      await this.getList()
    },
    create() {
      this.$router.push({ name: 'userCategoryCreate' })
    },
    async getList() {
      const { rows, total } = await getUserCategoryList(this.queryParams)
      this.list = rows
      this.total = total
    }
  },
  async created() {
    await this.getList()
  },
  render() {
    return <div class="app-container">
      <Query params={this.queryParams} onChange={this.changeQueryParams} onQuery={this.query} onCreate={this.create} />

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
