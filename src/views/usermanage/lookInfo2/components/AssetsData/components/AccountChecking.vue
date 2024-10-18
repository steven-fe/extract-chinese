<template>
  <div style="padding-bottom: 20px">
    <el-tabs
      v-model="activeName"
      type="card"
      lazy
    >
      <el-tab-pane
        label="对账结果"
        name="name0"
      >
        <!--form-->
        <p
          v-if="resultMsg"
          style="margin-top: 30px; font-size: 16px; font-weight: 600; color: #1ab394; text-align: center;"
        >{{ resultMsg }}</p>
        <!--table-->
        <p
          v-if="!resultMsg"
          style="font-size: 16px; line-height: 28px; font-weight: 600; color: red;"
        >对账异常列表：</p>
        <el-table
          v-if="!resultMsg"
          v-loading="loading"
          border
          :data="cryptoList"
        >
          <el-table-column
            label="币种ID"
            align="center"
            prop="currencyId"
          />
          <el-table-column
            :label="$t('common.coin')"
            align="center"
            prop="currencyName"
          />
          <el-table-column
            label="金额"
            align="center"
            prop="amount"
          />
        </el-table>
      </el-tab-pane>
      <el-tab-pane
        label="现货流水汇总"
        name="name1"
      >
        <el-form
          ref="queryForm"
          :model="queryParams"
          :inline="true"
          label-width="68px"
        >
          <el-form-item
            :label="$t('common.coin')"
            prop="currencyId"
          >
            <el-select
              v-model="queryParams.currencyId"
              size="mini"
              filterable
              clearable
              placeholder="请选择币种"
            >
              <el-option
                v-for="item in codeOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="日期"
            prop="time"
          >
            <el-date-picker
              v-model="time"
              clearable
              size="mini"
              type="daterange"
              :range-separator="$t('common.toTime')"
              value-format="yyyy-MM-dd"
              :start-placeholder="$t('common.startTime')"
              :end-placeholder="$t('common.endTime')"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >查询</el-button>
          </el-form-item>
        </el-form>
        <el-table
          ref="table"
          v-loading="loading2"
          border
          :data="tableList"
        >
          <el-table-column
            :label="$t('common.coin')"
            align="center"
          >
            <template slot-scope="scope">
              <div
                v-for="(item, index, key) in codeOptions"
                :key="key"
              >
                <span v-if="scope.row.currencyId == item.id">{{ item.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="充值"
            align="center"
            prop="U_STATE_DEPOSIT"
          />
          <el-table-column
            label="赠币"
            align="center"
            prop="U_STATE_PRESENT_COIN"
          />
          <el-table-column
            label="流动性配资"
            align="center"
            prop="U_STATE_ALLOCATION"
          />
          <el-table-column
            label="提现成功"
            align="center"
            prop="U_STATE_WITHDRAW"
          />
          <el-table-column
            label="提现⼿续费"
            align="center"
            prop="U_STATE_WITHDRAW_FEE"
          />
          <el-table-column
            label="资产回收"
            align="center"
            prop="U_STATE_RECOVERY"
          />
          <el-table-column
            label="业务账户转入"
            align="center"
            prop="U_STATE_TRANSFER_IN"
          />
          <el-table-column
            label="业务账户转出"
            align="center"
            prop="U_STATE_TRANSFER_OUT"
          />
          <el-table-column
            label="币币买入"
            align="center"
            prop="U_STATE_BUY"
          />
          <el-table-column
            label="币币卖出"
            align="center"
            prop="U_STATE_SELL"
          />
          <el-table-column
            label="场内交易⼿续费⽀出"
            align="center"
            prop="U_STATE_TRADE_FEE"
          />
          <el-table-column
            align="center"
            prop="U_STATE_OPERATE_IN"
            label="调账收⼊"
          />
          <el-table-column
            align="center"
            prop="U_STATE_OPERATE_OUT"
            label="调账⽀出"
          />
          <el-table-column
            align="center"
            prop="U_STATE_CO_TO_NOR_FLOW"
            label="合约转币币"
          />
          <el-table-column
            align="center"
            prop="U_STATE_NOR_TO_CO_FLOW"
            label="币币转合约"
          />
          <el-table-column
            align="center"
            prop="U_STATE_BRANCH_BONUS_RETURN"
            label="邀请返佣"
          />
          <el-table-column
            align="center"
            prop="U_STATE_LOOK_POSI"
            label="锁仓"
          />
          <el-table-column
            align="center"
            prop="U_STATE_TRADE_FEE_RETURN"
            label="交易负手续费返还"
          />
          <el-table-column
            align="center"
            prop="S_STATE_TRADE_FEE_RETURN"
            label="交易手续费返还"
          />
          <el-table-column
            align="center"
            prop="S_STATE_TRANSFER_FEE_RETURN"
            label="划转手续费返还"
          />
          <el-table-column
            align="center"
            prop="U_STATE_TRADE_TAX"
            label="交易税"
          />
          <el-table-column
            align="center"
            prop="U_STATE_OPERATE"
            label="调账"
          />
        </el-table>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import { reconciliationList, financeList } from '@/api/userinfo/userInfo'
export default {
  name: 'AccountChecking',
  props: ['userId', 'uid'],
  data() {
    return {
      loading: true,
      cryptoList: [],
      resultMsg: '',
      activeName: 'name0',
      loading2: false,
      // 查询参数
      queryParams: {
        uid: this.userId,
        currencyId: 1,
        firstTs: undefined,
        endTs: undefined
      },
      // 总条数
      total: 0,
      time: undefined,
      dataTemplate: {
        'currencyId': 1,
        'U_STATE_DEPOSIT': '0',
        'U_STATE_PRESENT_COIN': '0',
        'U_STATE_ALLOCATION': '0',
        'U_STATE_WITHDRAW': '0',
        'U_STATE_WITHDRAW_FEE': '0',
        'U_STATE_RECOVERY': '0',
        'U_STATE_TRANSFER_IN': '0',
        'U_STATE_TRANSFER_OUT': '0',
        'U_STATE_BUY': '0',
        'U_STATE_SELL': '0',
        'U_STATE_TRADE_FEE': '0',
        'U_STATE_OPERATE_IN': '0',
        'U_STATE_OPERATE_OUT': '0',
        'U_STATE_CO_TO_NOR_FLOW': '0',
        'U_STATE_NOR_TO_CO_FLOW': '0',
        'U_STATE_BRANCH_BONUS_RETURN': '0',
        'U_STATE_LOOK_POSI': '0',
        'U_STATE_TRADE_FEE_RETURN': '0',
        'S_STATE_TRADE_FEE_RETURN': '0',
        'S_STATE_TRANSFER_FEE_RETURN': '0',
        'U_STATE_TRADE_TAX': '0',
        'U_STATE_OPERATE': '0'
      },
      tableList: [],
      selectSymbol: undefined
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    }
  },
  created() {
    if (this.currencyList && this.currencyList[0]) {
      this.queryParams.currencyId = this.currencyList[0].id
    } else {
      this.queryParams.currencyId = 1
    }
    this.load()
  },
  mounted() {
    this.getList()
    setTimeout(() => {
      this.getList()
    }, 2000)
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      reconciliationList(this.uid)
        .then(response => {
          if (response.code === 200) {
            if ((response.data && response.data.length === 0) || !response.data) {
              this.resultMsg = '对账正常'
              return
            }
            this.resultMsg = ''
            this.cryptoList = response.data
          } else {
            this.cryptoList = []
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    /** 查询提现统计列表 */
    getList() {
      this.loading2 = false
      this.queryParams.firstTs = new Date(this.time && this.time[0]).getTime() || ''
      this.queryParams.endTs = new Date(this.time && this.time[1]).getTime() || ''
      financeList(this.queryParams).then((response) => {
        const res = response
        if (res.code === 200) {
          if (res.data.length) {
            const arr = []
            res.data.forEach((item) => {
              const str = JSON.stringify(this.dataTemplate)
              const obj = JSON.parse(str)
              obj.currencyId = item.currencyId
              item.list.forEach((subItem) => {
                obj[subItem.finaceType] = subItem.amount
              })
              arr.push(obj)
            })
            this.tableList = arr
          } else {
            this.tableList = []
          }
        }
        this.loading2 = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    handleExpand(index, row) {
      const $table = this.$refs.table
      $table.toggleRowExpansion(row)
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
.second-line {
  .el-form-item {
    margin: 0;
    width: 13%;
    text-align: center;
  }
}
</style>
