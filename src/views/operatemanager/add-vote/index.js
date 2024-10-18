import { Message } from 'element-ui'
import { getList, exportRecords } from '@/api/operate/add-vote'
import { download } from '@/utils/ruoyi'
import Query from './components/query'
import Table from './components/table'

export default {
  name: 'AddVote',
  data() {
    return {
      queryParams: {
        startTime: null,
        endTime: null,
        batchNumber: null,
        opType: null,
        uId: '',

        pageNum: 1,
        pageSize: 20
      },
      total: 0,
      list: [],
      selectionIds: []
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
      <Query
        params={this.queryParams}
        onChange={this.changeQueryParams}
        onQuery={this.getList}
        onExport={async() => {
          if (!this.selectionIds.length) return Message({ message: '请选择列表数据', type: 'error' })
          const { msg } = await exportRecords({ ids: this.selectionIds })
          download(msg)
        }}
      />

      <Table data={this.list} onSelectionChange={(list) => (this.selectionIds = list.map(({ id }) => id))} onUpdateList={this.getList} />

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
