<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item>
        <el-select v-model="selectType" size="mini" @change="changeSelectType">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams[selectType]" size="mini" clearable />
      </el-form-item>
      <el-form-item label="投资币种">
        <el-select v-model="queryParams.investmentCurrency" size="mini" clearable placeholder="请选择投资币种">
          <el-option v-for="item in investmentCurrencyList" :key="item.fid" :label="item.fcurrency" :value="item.fcurrency" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="queryParams.orderState" multiple size="mini" placeholder="请选择订单状态">
          <el-option v-for="item in orderStateOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <div>
        <el-form-item>
          <el-select v-model="selectTime" size="mini" @change="changeSelectTime">
            <el-option v-for="item in timeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-if="selectTime === 'investTime'"
            v-model="investTime"
            clearable
            size="mini"
            type="datetimerange"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startDate')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
            :default-time="['00:00:00', '23:59:59']"
          />
          <el-date-picker
            v-if="selectTime === 'expiredTime'"
            v-model="expiredTime"
            clearable
            size="mini"
            type="datetimerange"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startDate')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
            :default-time="['00:00:00', '23:59:59']"
          />
          <el-date-picker
            v-if="selectTime === 'arrivalTime'"
            v-model="arrivalTime"
            clearable
            size="mini"
            type="datetimerange"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startDate')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="handleQuery">{{ $t('common.search') }}</el-button>
          <el-button type="primary" size="mini" @click="handleExport">导出</el-button>
        </el-form-item>
      </div>
    </el-form>

    <ListTable :columns="columns" :data="orderList" />

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog title="资金记录" :visible.sync="open" width="800px">
      <ListTable :columns="dialogColumns" :data="dataList" />
    </el-dialog>
  </div>
</template>

<script>
import { getCurrencySortList } from '@/api/earn/currency-permission'
import { getPaymentRecordList, getOrderList } from '@/api/earn/order-list'
import ListTable from '@/components/list-table'
import * as api from './api'

export default {
  name: 'OrderList',
  components: {
    ListTable
  },
  data() {
    return {
      total: 0,
      selectType: 'productId', // productId 产品ID, productName 产品名称, orderId 订单ID, uid 用户UID
      selectTime: 'investTime', // investTime 认购时间， expiredTime 产品到期时间， arrivalTime 产品到账时间
      investTime: '',
      expiredTime: '',
      arrivalTime: '',
      flagId: undefined,
      queryParams: {
        productId: undefined,
        productName: undefined,
        orderId: undefined,
        uid: undefined,
        investmentCurrency: undefined,
        orderState: [], // 0 认购 1 计息中 2 已到期  3 已汇款  4 回款超时
        investBegin: undefined,
        investEnd: undefined,
        expiredBegin: undefined,
        expiredEnd: undefined,
        arrivalBegin: undefined,
        arrivalEnd: undefined,
        pageNum: 1,
        pageSize: 10
      },
      typeOptions: [
        { value: 'productId', label: '产品ID' },
        { value: 'productName', label: '产品名称' },
        { value: 'orderId', label: '订单ID' },
        { value: 'uid', label: '用户UID' }
      ],
      timeTypeOptions: [
        { value: 'investTime', label: '认购时间' },
        { value: 'expiredTime', label: '产品到期时间' },
        { value: 'arrivalTime', label: '产品到账时间' }
      ],
      orderStateOptions: [
        { value: 0, label: '已存入' },
        { value: 1, label: this.$t('earn.interestsCount') },
        { value: 2, label: this.$t('earn.wasDue') },
        { value: 3, label: this.$t('earn.returnedMoney') },
        { value: 4, label: '回款超时' }
      ],
      orderSourceOptions: [
        { value: 0, label: '手动认购' },
        { value: 1, label: '自动复投' }
      ],
      payTypes: [
        { value: 0, label: '定期-利息到账' },
        { value: 1, label: '定期-本金回款' },
        { value: 2, label: '定期-申购' }
      ],
      investmentCurrencyList: [],

      orderList: [],
      columns: Object.freeze([
        {
          label: '操作',
          prop: 'operation',
          minWidth: 150,
          fixed: true,
          renderCell: (h, { row }) => {
            const { orderId } = row
            return h('div', {}, [
              h('el-button', {
                props: { type: 'primary', size: 'mini' },
                on: {
                  click: this.getFinancialRecords.bind(this, orderId)
                }
              }, '资金记录')
            ])
          }
        },
        { label: '认购时间', prop: 'createTime', minWidth: 170, formatter: 'formatTime' },
        { label: '订单ID', prop: 'orderId', minWidth: 170 },
        { label: '产品ID', prop: 'productId', minWidth: 80 },
        { label: '产品显示名称（英文）', prop: 'productName', minWidth: 200 },
        { label: '投资用户UID', prop: 'uid', minWidth: 170 },
        { label: '投资币种', prop: 'investmentCurrency', minWidth: 80 },
        { label: '投资数量', prop: 'investmentAmt', minWidth: 170 },
        { label: '认购方式', prop: 'orderSource', minWidth: 120, formatter: ({ orderSource }) => this.orderSourceOptions.map(item => item.value === orderSource ? item.label : '') },
        { label: '收益币种', prop: 'incomeCurrency', minWidth: 80 },
        { label: '投资期限和年化收益率', prop: 'investmentCycle', minWidth: 200, formatter: ({ investmentCycle, annualizedIncome }) => `${investmentCycle}天 | APR:${annualizedIncome}%` },
        { label: '利息金额', prop: 'incomeAmount', minWidth: 170 },
        { label: '本息总额', prop: 'principalIncomeAmount', minWidth: 170 },
        { label: '订单状态', prop: 'orderState', minWidth: 120, formatter: ({ orderState }) => this.orderStateOptions.map(item => item.value === orderState ? item.label : '') },
        { label: '起息时间', prop: 'interestStartTime', minWidth: 170, formatter: 'formatTime' },
        { label: '到期时间', prop: 'interestEndTime', minWidth: 170, formatter: 'formatTime' },
        { label: '到账时间', prop: 'paymentTime', minWidth: 170, formatter: 'formatTime' }
      ]),
      open: false,
      dialogColumns: Object.freeze([
        { label: '时间', prop: 'time', minWidth: 170, formatter: 'formatTime' },
        { label: '币种', prop: 'currencyCode', minWidth: 80 },
        { label: '数量', prop: 'amount', minWidth: 80 },
        { label: '类型', prop: 'payType', minWidth: 120, formatter: ({ payType }) => this.payTypes.map(item => item.value === payType ? item.label : '') }
      ]),
      dataList: []
    }
  },
  created() {
    this.getList()
    this.getInvestmentCurrencyList()
  },
  methods: {
    async getInvestmentCurrencyList() {
      const { rows } = await getCurrencySortList({ pageNum: 1, pageSize: 999999 })
      this.investmentCurrencyList = rows
    },
    async getList() {
      this.queryParams.investBegin = (this.investTime && this.investTime[0]) || undefined
      this.queryParams.investEnd = (this.investTime && this.investTime[1]) || undefined

      this.queryParams.expiredBegin = (this.expiredTime && this.expiredTime[0]) || undefined
      this.queryParams.expiredEnd = (this.expiredTime && this.expiredTime[1]) || undefined

      this.queryParams.arrivalBegin = (this.arrivalTime && this.arrivalTime[0]) || undefined
      this.queryParams.arrivalEnd = (this.arrivalTime && this.arrivalTime[1]) || undefined

      const { rows, total } = await getOrderList(this.queryParams)
      this.orderList = rows
      this.total = total
    },
    changeSelectTime(value) {
      if (value === 'investTime') {
        this.expiredTime = ''
        this.arrivalTime = ''
      }
      if (value === 'expiredTime') {
        this.investTime = ''
        this.arrivalTime = ''
      }
      if (value === 'arrivalTime') {
        this.expiredTime = ''
        this.investTime = ''
      }
    },
    async getDialogFormList() {
      const { data } = await getPaymentRecordList({ orderId: this.flagId })
      this.dataList = data
    },
    getFinancialRecords(orderId) {
      this.flagId = orderId
      this.getDialogFormList()
      this.open = true
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    async handleExport() {
      const queryParams = { ...this.queryParams }

      queryParams.investBegin = (this.investTime && this.investTime[0]) || undefined
      queryParams.investEnd = (this.investTime && this.investTime[1]) || undefined

      queryParams.expiredBegin = (this.expiredTime && this.expiredTime[0]) || undefined
      queryParams.expiredEnd = (this.expiredTime && this.expiredTime[1]) || undefined

      queryParams.arrivalBegin = (this.arrivalTime && this.arrivalTime[0]) || undefined
      queryParams.arrivalEnd = (this.arrivalTime && this.arrivalTime[1]) || undefined

      delete queryParams.pageNum
      delete queryParams.pageSize

      const { msg } = await api.exportList(queryParams)
      this.download(msg)
      this.msgSuccess(this.$t('financemanager.exportSuccessfully'))
    },

    changeSelectType(val) {
      if (this.selectType === 'productId') {
        this.queryParams.productName = undefined
        this.queryParams.orderId = undefined
        this.queryParams.uid = undefined
      }
      if (this.selectType === 'productName') {
        this.queryParams.productId = undefined
        this.queryParams.orderId = undefined
        this.queryParams.uid = undefined
      }
      if (this.selectType === 'orderId') {
        this.queryParams.productName = undefined
        this.queryParams.productId = undefined
        this.queryParams.uid = undefined
      }
      if (this.selectType === 'uid') {
        this.queryParams.productName = undefined
        this.queryParams.orderId = undefined
        this.queryParams.productId = undefined
      }
    }
  }
}
</script>
