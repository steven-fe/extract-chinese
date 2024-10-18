import Query from './components/query'
import Table from '../components/Table/index'
import styles from './index.module.scss'
import { getDataList, exportData, exportOrdersData } from '@/api/earn/product-data'
import { parseTime } from '@/utils/ruoyi'
import { productType as productTypeMap, noviceExclusiveState } from '../commData/index'
import single from '../product-management/components/single'
export default {
  name: 'productData',
  components: {},
  data() {
    return {
      queryParams: {
        investmentCurrency: null,
        productId: null,
        productType: null,
        noviceExclusive: null,
        searchType: 'id',
        searchTime: 'createTime', // createTime 创建时间，expiredTime 到期时间
        productName: null,
        startTs: null,
        endTs: null,
        expiredBegin: null,
        expiredEnd: null,
        pageNum: 1,
        pageSize: 20
      },

      total: 0,
      list: [],

      columns: [
        {
          prop: 'operation',
          label: '操作',
          width: '200',
          fixed: 'left',
          renderOperations: ({ productId }) => {
            return (
              <div class="table-operation-wrapper">
                <el-button
                  type="text"
                  size="mini"
                  onClick={async() => {
                    try {
                      const { msg } = await exportData(productId)
                      this.download(msg)
                    } catch (error) {
                      console.log(error)
                    }
                  }}
                >
                  导出产品数据
                </el-button>

                <el-button
                  type="text"
                  size="mini"
                  onClick={async() => {
                    try {
                      const { msg } = await exportOrdersData({ id: productId })
                      this.download(msg)
                    } catch (error) {
                      console.log(error)
                    }
                  }}
                >
                  导出订单数据
                </el-button>
              </div>
            )
          }
        },
        {
          prop: 'productId',
          label: '产品ID',
          width: '150',
          formatter: ({ productId }) => {
            return <el-button type="text" onClick={() => single.open({ id: productId, type: 'view' })}>{productId}</el-button>
          }
        },
        {
          prop: 'productName',
          label: '产品显示名称(英文)',
          width: '280'
        },
        {
          prop: 'productType',
          label: '产品类型',
          formatter: ({ productType }) => {
            return productTypeMap.find(item => item.id === productType).name
          }
        },
        {
          prop: 'noviceExclusive',
          label: '新手专享',
          formatter: ({ noviceExclusive }) => {
            return noviceExclusiveState.find(item => item.id === noviceExclusive).name
          }
        },
        {
          prop: 'investmentCurrency',
          label: '投资币种'
        },
        {
          prop: 'raiseTotalQuota',
          label: '募集总额'
        },
        {
          prop: 'quotaSubscribed',
          label: '已申购金额',
          width: '150'
        },
        {
          prop: 'totalUserCount',
          label: '已申购人数',
          width: '100'
        },
        {
          prop: 'incomeCurrency',
          label: '收益币种'
        },
        {
          prop: 'investmentCycle',
          label: '投资期限和年化收益率',
          width: '200',
          formatter: ({ investmentCycle, annualizedIncome }) => {
            return `${investmentCycle}天 | APR:${annualizedIncome}%`
          }
        },
        {
          prop: 'createTs',
          label: '创建时间',
          width: '180',
          formatter: ({ createTs }) => {
            return `${parseTime(
              createTs,
              '{y}-{m}-{d} {h}:{i}'
            )}`
          }
        },
        {
          prop: 'paymentTs',
          label: '还本付息时间',
          width: '180',
          formatter: ({ paymentTs }) => {
            return `${parseTime(
              paymentTs,
              '{y}-{m}-{d} {h}:{i}'
            )}`
          }
        },
        {
          prop: 'incomeAmount',
          label: '利息金额',
          width: '120'
        },
        {
          prop: 'principalIncomeAmount',
          label: '本息总额',
          width: '120'
        }
      ]
    }
  },
  methods: {
    changeQueryParams(options) {
      for (const key in options) {
        this.queryParams[key] = options[key]
      }
      if (options.searchType === 'name') {
        this.queryParams.productId = null
      }
      if (options.searchType === 'id') {
        this.queryParams.productName = null
      }
      if (options.searchTime === 'createTime') {
        this.queryParams.expiredBegin = null
        this.queryParams.expiredEnd = null
      }
      if (options.searchTime === 'expiredTime') {
        this.queryParams.startTs = null
        this.queryParams.endTs = null
      }
    },
    async getList() {
      try {
        const params = { ...this.queryParams }
        delete params.searchType
        delete params.searchTime
        const { rows, total } = await getDataList(params)
        this.list = rows
        this.total = total
      } catch (error) {
        console.log(error)
      }
    }
  },
  async created() {
    await this.getList()
  },
  render() {
    return (
      <div class="app-container">
        <Query
          params={this.queryParams}
          onChange={this.changeQueryParams}
          onQuery={this.getList}
          onAdd={() => {
            this.dialogVisible = true
            this.handleProductParams = {
              id: null,
              firstCopyTime: null,
              copyInterval: null,
              copyNumber: null
            }
            this.clearFromValidate()
          }}

        />
        <p class={styles.tips}>提示：下方列表只展示募集已开始（募集开始时间早于当前时间）的理财产品，未开始募集的产品不在下方展示。</p>
        <Table
          tableOptions={{ border: true }}
          tableData={this.list}
          columns={this.columns}
        />

        {this.total > 0 && (
          <Pagination
            total={this.total}
            page={this.queryParams.pageNum}
            limit={this.queryParams.pageSize}
            on={{
              'update:page': ($event) => (this.queryParams.pageNum = $event),
              'update:limit': ($event) => (this.queryParams.pageSize = $event)
            }}
            onPagination={this.getList}
          />
        )}
      </div>
    )
  }
}
