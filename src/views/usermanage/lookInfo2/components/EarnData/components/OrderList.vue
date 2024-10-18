<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item>
        <el-select
          v-model="type1"
          size="mini"
          filterable
          @change="type1Change"
        >
          <el-option
            v-for="(item,index) in searchTypeOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="type1Value" on size="mini" :placeholder="type1Placeholder" clearable @change="type1Input" />
      </el-form-item>
      <el-form-item :label="$t('userManager.investCurrency')" prop="investmentCurrency">
        <el-select
          v-model="queryParams.investmentCurrency"
          size="mini"
          filterable
          clearable
          :placeholder="$t('userManager.selectCurrency')"
        >
          <el-option value="" :label="$t('userManager.all')" />
          <el-option
            v-for="(item,index) in currencyList"
            :key="index"
            :label="item.fcurrency"
            :value="item.fcurrency"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.orderStatus')" prop="orderState">
        <el-select
          v-model="queryParams.orderState"
          size="mini"
          filterable
          clearable
          :placeholder="$t('userManager.orderStatus')"
          multiple
        >
          <el-option
            v-for="(item,index) in orderStatusOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="type2"
          size="mini"
          filterable
          @change="type2Change"
        >
          <el-option
            v-for="(item,index) in timeTypeOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="type2Value"
          clearable
          size="mini"
          type="datetimerange"
          :range-separator="$t('userManager.to')"
          :start-placeholder="$t('userManager.startTime')"
          :end-placeholder="$t('userManager.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="type2Input"
        />
      </el-form-item>
      <el-form-item label prop="symbol">
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{ $t('userManager.search') }}</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <el-table v-loading="loading" border :data="tableData">
      <el-table-column :label="$t('userManager.operate')" width="150" align="center" fixed="left">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="getFundData(scope.row.orderId)">{{ $t('userManager.fundList') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.buyTime')" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.orderID')" width="180" align="center" prop="orderId" />
      <el-table-column :label="$t('userManager.productID')" align="center" prop="productId" width="180" />
      <el-table-column :label="$t('userManager.productShoName')" align="center" prop="productName" width="200" />
      <el-table-column :label="$t('userManager.investCurrency')" align="center" prop="investmentCurrency" width="180" />
      <el-table-column :label="$t('userManager.invsetAmount')" align="center" prop="investmentAmt" />
      <el-table-column :label="$t('userManager.buyType')" align="center" prop="orderSource">
        <template slot-scope="scope">
          {{ +scope.row.orderSource === 0 ? $t('userManager.handBuy') : $t('userManager.autoBuy') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.earningsCurrency')" align="center" prop="incomeCurrency" />
      <el-table-column :label="$t('userManager.timeLimitYield')" align="center" prop="investmentCycle" width="200">
        <template slot-scope="scope">
          {{ `${scope.row.investmentCycle}天 | APR:${scope.row.annualizedIncome}%` }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.interestPrice')" prop="incomeAmount" align="center" width="180" />
      <el-table-column :label="$t('userManager.priceCount')" prop="principalIncomeAmount" align="center" width="180" />
      <el-table-column :label="$t('userManager.orderStatus')" prop="orderState" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ orderStatusMap[scope.row.orderState] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.interestStartTime')" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.interestStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.interestEndTime')" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.interestEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.intoTime')" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.paymentTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="load"
      />
    </div>
    <!-- 资金列表 -->
    <el-dialog :title="$t('userManager.fundList')" :close-on-click-modal="false" :visible.sync="fundListVisible" top="20vh !important">
      <div style="margin-bottom: 10px;">{{ $t('userManager.earnOrderID') }} {{ currentOrderId }}</div>
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
import { getOrderList } from '@/api/earn/order-list'
import { getCurrencySortList } from '@/api/earn/currency-permission'
import { getFundList } from '@/api/user'
import dayjs from 'dayjs'
export default {
  name: 'OrderList',
  props: ['msg', 'uid'],
  data() {
    return {
      loading: false,
      searchTypeOptions: [
        {
          value: 1,
          label: this.$t('userManager.productID')
        },
        {
          value: 2,
          label: this.$t('userManager.productName')
        },
        {
          value: 3,
          label: this.$t('userManager.orderID')
        }
      ],
      orderStatusOptions: [
        {
          value: 0,
          label: this.$t('userManager.orderStatus6')
        },
        {
          value: 1,
          label: this.$t('userManager.orderStatus2')
        },
        {
          value: 2,
          label: this.$t('userManager.orderStatus3')
        },
        {
          value: 3,
          label: this.$t('userManager.orderStatus4')
        },
        {
          value: 4,
          label: this.$t('userManager.orderStatus5')
        }
      ],
      timeTypeOptions: [
        {
          value: 1,
          label: this.$t('userManager.timeType1')
        },
        {
          value: 2,
          label: this.$t('userManager.timeType2')
        },
        {
          value: 3,
          label: this.$t('userManager.timeType3')
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        productId: '',
        productName: '',
        orderId: '',
        uid: this.uid,
        investmentCurrency: '',
        orderState: [],
        investBegin: '',
        investEnd: '',
        expiredBegin: '',
        expiredEnd: '',
        arrivalBegin: '',
        arrivalEnd: ''
      },
      type1: 1, // 产品ID 2 产品名称 3 订单ID 
      type1Value: '',
      type1Placeholder: this.$t('userManager.searchProcudtID'),
      type2: 1, // 投资时间 2 产品到期时间 3 产品到账时间
      type2Value: [],
      type2Placeholder: '',
      tableData: [],
      total: 0,
      orderStatusMap: {
        0: this.$t('userManager.orderStatus1'),
        1: this.$t('userManager.orderStatus2'),
        2: this.$t('userManager.orderStatus3'),
        3: this.$t('userManager.orderStatus4'),
        4: this.$t('userManager.orderStatus5')
      },
      currencyList: [],
      fundListVisible: false,
      currentOrderId: null,
      fundList: [],
      payTypeMap: {
        0: this.$t('userManager.payType1'),
        1: this.$t('userManager.payType2'),
        2: this.$t('userManager.payType3')
      }
    }
  },
  created() {
    this.getCurrencySortList()
    this.load()
  },
  methods: {
    async getFundData(orderId) {
      this.currentOrderId = orderId
      try {
        const { data } = await getFundList(orderId)
        this.fundList = data
        this.fundListVisible = true
      } catch (error) {
        console.log(error)
      }
    },
    // 加载
    async load() {
      this.loading = true
      try {
        const newParams = {}
        for (const key in this.queryParams) {
          if (Object.hasOwnProperty.call(this.queryParams, key)) {
            const element = this.queryParams[key]
            if (element) {
              newParams[key] = element
            }
          }
        }
        this.queryParams.uid = this.uid
        const { rows, total } = await getOrderList(newParams)
        this.tableData = rows
        this.total = total
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    type1Change() {
      this.type1Value = ''
      if (this.type1 === 1) {
        this.type1Placeholder = this.$t('userManager.searchProcudtID')
      } else if (this.type1 === 2) {
        this.type1Placeholder = this.$t('userManager.searchProcudtName')
      } else {
        this.type1Placeholder = this.$t('userManager.searchOrderID')
      }
      this.queryParams = {
        ...this.queryParams,
        productId: '',
        productName: '',
        orderId: '',
        uid: this.uid
      }
    },
    type1Input() {
      const type = this.type1
      if (type === 1) {
        this.queryParams.productId = this.type1Value
      } else if (type === 2) {
        this.queryParams.productName = this.type1Value
      } else if (type === 3) {
        this.queryParams.orderId = this.type1Value
      }
    },
    type2Change() {
      this.type2Value = []
      this.queryParams = {
        ...this.queryParams,
        investBegin: '',
        investEnd: '',
        expiredBegin: '',
        expiredEnd: '',
        arrivalBegin: '',
        arrivalEnd: ''
      }
    },
    type2Input() {
      if (this.type2Value && this.type2Value.length > 0) {
        const type = this.type2
        const [s, e] = this.type2Value
        console.log(s, e)
        const sTime = dayjs(s).valueOf()
        const eTime = dayjs(e).endOf('day').valueOf()
        if (type === 1) {
          this.queryParams.investBegin = sTime
          this.queryParams.investEnd = eTime
        } else if (type === 2) {
          this.queryParams.expiredBegin = sTime
          this.queryParams.expiredEnd = eTime
        } else if (type === 3) {
          this.queryParams.arrivalBegin = sTime
          this.queryParams.arrivalEnd = eTime
        }
      } else {
        this.queryParams = {
          ...this.queryParams,
          investBegin: '',
          investEnd: '',
          expiredBegin: '',
          expiredEnd: '',
          arrivalBegin: '',
          arrivalEnd: ''
        }
      }
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
