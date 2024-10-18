<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item :label="$t('userManager.investCurrency')" prop="currencyNames">
        <el-select
          v-model="queryParams.currencyNames"
          size="mini"
          filterable
          clearable
          :placeholder="$t('userManager.selectCurrency')"
          multiple
        >
          <el-option
            v-for="(item,index) in currencyList"
            :key="index"
            :label="item.fcurrency"
            :value="item.fcurrency"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{ $t('userManager.search') }}</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <h5>{{ $t('userManager.earnTip') }}</h5>
    <!-- 资产列表 -->
    <el-table v-loading="loading" border :data="tableData">
      <el-table-column :label="$t('userManager.operate')" align="center" prop="operate">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="getOrderList(scope.row)">{{ $t('userManager.getOrder') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.investCurrency')" align="center" prop="investmentCurrency" />
      <el-table-column :label="$t('userManager.invsetAmount')" align="center" prop="amount" />
      <el-table-column :label="$t('userManager.waitInterest')" align="center" prop="estimateIncome" />
      <el-table-column :label="$t('userManager.waitCount')" align="center" prop="totalAmount" />
    </el-table>
    <!-- 订单列表 -->
    <el-dialog :title="$t('userManager.userEarnOrder')" :close-on-click-modal="false" :visible.sync="orderListVisible" width="70%">
      <el-table :data="orderData">
        <el-table-column :label="$t('userManager.operate')" fixed="left" width="160" align="center" prop="operate">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="getOrderFundList(scope.row)">{{ $t('userManager.fundList') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column property="createTime" width="180" :label="$t('userManager.buyTime')">
          <template slot-scope="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column property="orderId" width="180" :label="$t('userManager.orderID')" />
        <el-table-column property="productId" width="180" :label="$t('userManager.productID')" />
        <el-table-column property="productName" width="280" :label="$t('userManager.productName')" />
        <el-table-column property="investmentCurrency" width="180" :label="$t('userManager.investCurrency')" />
        <el-table-column property="investmentAmt" width="180" :label="$t('userManager.invsetAmount')" />
        <el-table-column property="orderSource" width="180" :label="$t('userManager.buyType')">
          <template slot-scope="scope">
            {{ +scope.row.inputType === 0 ? $t('userManager.handBuy') : $t('userManager.autoBuy') }}
          </template>
        </el-table-column>
        <el-table-column property="incomeCurrency" width="180" :label="$t('userManager.earningsCurrency')" />
        <el-table-column property="investmentCycle" width="250" :label="$t('userManager.timeLimitYield')">
          <template slot-scope="scope">
            {{ scope.row.investmentCycle + '|' + scope.row.annualizedIncome + '%' }}
          </template>
        </el-table-column>
        <el-table-column property="incomeAmount" width="180" :label="$t('userManager.interestPrice')" />
        <el-table-column property="principalIncomeAmount" width="180" :label="$t('userManager.priceCount')" />
        <el-table-column property="orderState" width="180" :label="$t('userManager.orderStatus')">
          <template slot-scope="scope">
            {{ orderStateMap[scope.row.orderState] }}
          </template>
        </el-table-column>
        <el-table-column property="interestStartTime" width="180" :label="$t('userManager.interestStartTime')">
          <template slot-scope="scope">
            {{ parseTime(scope.row.interestStartTime) }}
          </template>
        </el-table-column>
        <el-table-column property="interestEndTime" width="180" :label="$t('userManager.interestEndTime')">
          <template slot-scope="scope">
            {{ parseTime(scope.row.interestEndTime) }}
          </template>
        </el-table-column>
        <el-table-column property="paymentTime" width="180" :label="$t('userManager.intoTime')">
          <template slot-scope="scope">
            {{ parseTime(scope.row.paymentTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!-- 资金列表 -->
    <el-dialog :title="$t('userManager.fundList')" :close-on-click-modal="false" :visible.sync="fundListVisible" top="20vh !important">
      {{ $t('userManager.earnOrderID') }} {{ currentOrderId }}
      <el-table :data="fundList">
        <el-table-column prop="time" :label="$t('userManager.time')">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.time) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="currencyCode" :label="$t('userManager.currency')" />
        <el-table-column prop="amount" :label="$t('userManager.amount')" />
        <el-table-column prop="payType" :label="$t('userManager.type')">
          <template slot-scope="scope">
            <span>{{ payTypeMap[scope.row.payType] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getEarnList, getFundList } from '@/api/user'
import { getCurrencySortList } from '@/api/earn/currency-permission'
export default {
  name: 'DealList',
  props: ['msg'],
  data() {
    return {
      loading: false,
      // 查询参数
      queryParams: {
        currencyNames: [],
        userId: this.msg
      },
      tableData: [],
      orderListVisible: false,
      orderData: [],
      fundList: [],
      fundListVisible: false,
      currentOrderId: null,
      orderStateMap: {
        0: this.$t('userManager.orderStatus1'),
        1: this.$t('userManager.orderStatus2'),
        2: this.$t('userManager.orderStatus3'),
        3: this.$t('userManager.orderStatus4'),
        4: this.$t('userManager.orderStatus5')
      },
      payTypeMap: {
        0: this.$t('userManager.payType1'),
        1: this.$t('userManager.payType2'),
        2: this.$t('userManager.payType3')
      },
      currencyList: []
    }
  },
  created() {
    this.getCurrencySortList()
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      getEarnList(this.queryParams)
        .then(response => {
          if (response.code === 200) {
            this.tableData = response.data
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
          this.loading = false
        })
    },
    async getOrderList(row) {
      try {
        this.orderData = row.orderList
      } catch (error) {
        console.log(error)
      }
      this.orderListVisible = true
    },
    async getOrderFundList(row) {
      try {
        this.fundList = []
        const { data } = await getFundList(row.orderId)
        this.currentOrderId = row.orderId
        this.fundList = data
      } catch (error) {
        console.log(error)
      }
      this.fundListVisible = true
    },
    async getCurrencySortList() {
      try {
        const { rows } = await getCurrencySortList({
          pageNum: 1,
          pageSize: 9999
        })
        this.currencyList = rows
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped>
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100%;
  }

  .top {
    margin-top: 20px;
  }
</style>
