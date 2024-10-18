import { getList } from '@/api/discover/management'
import Query from './components/query'
import Table from './components/table'
import single from './components/single'

export default {
  name: 'ApplicationManagement',
  data() {
    return {
      queryParams: {
        title: null,
        language: null,
        state: null,

        pageNum: 1,
        pageSize: 99999
      },

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
      const { rows } = await getList(this.queryParams)
      this.list = (rows || []).sort((row1, row2) => (row2.weight - row1.weight))
    }
  },
  async created() {
    await this.getList()
  },
  render() {
    return <div class="app-container">
      <Query params={this.queryParams} onChange={this.changeQueryParams} onQuery={this.getList} onAdd={() => single.open(undefined, () => this.getList())} />

      <Table data={this.list} onUpdateList={this.getList} />
    </div>
  }
}
