import { getInvestmentCurrencyList, productType, noviceExclusiveState } from '../../../commData/index'
export default {
  name: 'Query',
  props: {
    params: {
      type: Object
    }
  },
  methods: {
    change(options) {
      this.$emit('change', options)
    },
    async getInvestmentCurrencyList() {
      this.investmentCurrencyList = await getInvestmentCurrencyList()
    }
  },
  data() {
    return {
      investmentCurrencyList: []
    }
  },
  created() {
    this.getInvestmentCurrencyList()
  },
  render() {
    return (
      <el-form ref="queryForm" props={{ model: this.params }} inline>
        <el-form-item>
          <el-select
            value={this.params.searchType}
            size="mini"
            placeholder="全部"
            onInput={(searchType) => this.change({ searchType })}
          >
            <el-option key="id" label="产品ID" value="id" />
            <el-option key="name" label="产品名称" value="name" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-input
            value={this.params.searchType === 'id' ? this.params.productId : this.params.productName}
            placeholder={
              this.params.searchType === 'id' ? '搜索产品ID' : '搜索产品名称'
            }
            clearable
            size="mini"
            onInput={(val) => {
              this.params.searchType === 'id' ? this.change({ productId: val || null }) : this.change({ productName: val || null })
            }}
          />
        </el-form-item>

        <el-form-item label="投资币种">
          <el-select
            value={this.params.investmentCurrency}
            size="mini"
            filterable
            clearable
            placeholder="全部"
            onInput={(investmentCurrency) => this.change({ investmentCurrency })}
          >
            {
              this.investmentCurrencyList.map(({ fid, fcurrency }) => {
                return <el-option key={fid} label={fcurrency} value={fcurrency} />
              })
            }
          </el-select>
        </el-form-item>

        <el-form-item label="产品类型">
          <el-select
            value={this.params.productType}
            size="mini"
            filterable
            clearable
            placeholder="全部"
            onInput={(productType) => this.change({ productType })}
          >
            {
              (productType || []).map(({ id, name }) => <el-option key={id} label={name} value={id} />)
            }
          </el-select>
        </el-form-item>

        <el-form-item label="新手专享">
          <el-select
            value={this.params.noviceExclusive}
            size="mini"
            filterable
            clearable
            placeholder="全部"
            onInput={(noviceExclusive) => this.change({ noviceExclusive })}
          >

            {
              (noviceExclusiveState || []).map(({ id, name }) => <el-option key={id} label={name} value={id} />)
            }
          </el-select>
        </el-form-item>

        <div>
          <el-form-item>
            <el-select
              value={this.params.searchTime}
              size="mini"
              placeholder="全部"
              onInput={(searchTime) => this.change({ searchTime })}
            >
              <el-option key="createTime" label="产品创建时间" value="createTime" />
              <el-option key="expiredTime" label="产品到期时间" value="expiredTime" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-date-picker
              props={{
                clearable: true,
                size: 'mini',
                type: 'datetimerange',
                format: 'yyyy-MM-dd HH:mm',
                'start-placeholder': '开始时间',
                'range-separator': '至',
                'end-placeholder': '结束时间',
                'value-format': 'timestamp',
                'default-time': ['00:00:00', '23:59:59']
              }}
              value={this.params.searchTime === 'createTime' ? (this.params.startTs && this.params.endTs ? [new Date(this.params.startTs), new Date(this.params.endTs)] : null) : (this.params.expiredBegin && this.params.expiredEnd ? [new Date(this.params.expiredBegin), new Date(this.params.expiredEnd)] : null)}
              onInput={($event) =>
                this.params.searchTime === 'createTime'
                  ? this.change(
                    Array.isArray($event)
                      ? { startTs: $event[0], endTs: $event[1] }
                      : { startTs: null, endTs: null }
                  )
                  : this.change(
                    Array.isArray($event)
                      ? { expiredBegin: $event[0], expiredEnd: $event[1] }
                      : { expiredBegin: null, expiredEnd: null }
                  )
              }
            />
          </el-form-item>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            onClick={this.$emit.bind(this, 'query')}
          >
            搜索
          </el-button>
        </el-form-item>
      </el-form>
    )
  }
}
