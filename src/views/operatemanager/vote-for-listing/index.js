import { getList } from '@/api/operate/vote-for-listing'
import Query from './components/query'
import Table from './components/table'
import single from './components/single'

export default {
  name: 'VoteForListing',
  data() {
    return {
      queryParams: {
        id: '',
        startTime: null,
        endTime: null,
        currencyId: null,
        state: null,
        voteResult: null,

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
    async getList() {
      const { rows, total } = await getList(this.queryParams)
      this.list = rows
      this.total = total
    }
  },
  async created() {
    await this.getList()
  },
  render() {
    return <div class="app-container">
      <Query params={this.queryParams} onChange={this.changeQueryParams} onQuery={this.getList} onAdd={() => single.open(undefined, () => this.getList())} />

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
