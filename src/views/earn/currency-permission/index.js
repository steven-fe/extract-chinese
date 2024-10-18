import { getCurrencySortList } from '@/api/earn/currency-permission'
import Query from './components/query'
import Table from './components/table'
import single from './components/single'
import { commonData } from './data'

export default {
  name: 'CurrencyPermission',
  data() {
    return {
      queryParams: {
        currencyName: null,

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
      const { rows, total } = await getCurrencySortList(this.queryParams)
      this.list = rows
      this.total = total
      commonData.maxSort = this.queryParams.pageNum === 1 && this.list && this.list.length ? this.list[0].fsort : this.maxSort
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
              'update:page': $event => (this.queryParams.pageNum = $event),
              'update:limit': $event => (this.queryParams.pageSize = $event)
            }}
            onPagination={this.getList}
          />
        )
      }
    </div>
  }
}
