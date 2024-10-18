<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item :label="$t('userManager.buyCurrency')" prop="currencyIds">
        <el-select
          v-model="queryParams.currencyIds"
          size="mini"
          filterable
          clearable
          :placeholder="$t('userManager.selectCurrency')"
          multiple
        >
          <el-option
            v-for="(item,index) in currencyList"
            :key="index"
            :label="item.currencyCode"
            :value="item.currencyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{ $t('userManager.search') }}</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <h5>{{ $t('userManager.launchpadTip') }}</h5>
    <el-table v-loading="loading" border :data="tableData">
      <el-table-column :label="$t('userManager.operate')" align="center" prop="operate">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="getOrderList(scope.row)">{{ $t('userManager.getres') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.buyCurrency')" align="center" prop="subCurrencyCode" />
      <el-table-column :label="$t('userManager.buyPrice')" align="center" prop="subAmount" />
      <el-table-column :label="$t('userManager.openBuyPrice')" align="center" prop="publicSubAmount" />
      <el-table-column :label="$t('userManager.wlBuyPrice')" align="center" prop="whiteSubAmount" />
    </el-table>
    <!-- 订单列表 -->
    <el-dialog :title="$t('userManager.userLaunchpadList')" :close-on-click-modal="false" :visible.sync="orderListVisible" width="70%">
      <el-table :data="orderData">
        <el-table-column property="subTime" width="180" :label="$t('userManager.buyTime')">
          <template slot-scope="scope">
            {{ parseTime(scope.row.subTime) }}
          </template>
        </el-table-column>
        <el-table-column property="activityId" width="180" :label="$t('userManager.activeID')" />
        <el-table-column property="currencyCode" width="180" :label="$t('userManager.launchpadCurrency')" />
        <el-table-column property="subscriptionType" width="180" :label="$t('userManager.buyModeType')">
          <template slot-scope="scope">
            {{ scope.row.subscriptionType === 0 ? $t('userManager.openBuy') : $t('userManager.wlBuy') }}
          </template>
        </el-table-column>
        <el-table-column property="subPrice" width="180" :label="$t('userManager.buyCount')" />
        <el-table-column property="subAmount" width="180" :label="$t('userManager.buyPrice')" />
        <el-table-column property="returnAmount" width="180" :label="$t('userManager.returnAmount')">
          <template slot-scope="scope">
            {{ scope.row.returnAmount ? scope.row.returnAmount : '--' }}
          </template>
        </el-table-column>
        <el-table-column property="distributionAmount" width="180" :label="$t('userManager.disAmount')">
          <template slot-scope="scope">
            {{ scope.row.distributionAmount ? scope.row.distributionAmount : '--' }}
          </template>
        </el-table-column>
        <el-table-column property="estimateIncome" width="180" :label="$t('userManager.status')">
          <template slot-scope="scope">
            {{ statusMap[scope.row.status] }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getLaunchpadList, getLaunchpadCurrencyList } from '@/api/user'
import dayjs from 'dayjs'
export default {
  name: 'DealList',
  props: ['msg'],
  data() {
    return {
      loading: false,
      // 查询参数
      queryParams: {
        currencyIds: [],
        userId: this.msg
      },
      tableData: [],
      orderListVisible: false,
      orderData: [],
      currentOrderId: null,
      type2: 1, // 投资时间 2 产品到期时间 3 产品到账时间
      type2Value: [],
      statusMap: {
        1: this.$t('userManager.launchpadStatus1'),
        2: this.$t('userManager.launchpadStatus2'),
        3: this.$t('userManager.launchpadStatus3'),
        4: this.$t('userManager.launchpadStatus1')
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
      getLaunchpadList(this.queryParams)
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
      // 取列表 orderList
      this.orderListVisible = true
      this.orderData = row.orderList
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
      const type = this.type2
      const [s, e] = this.type2Value
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
    },
    async getCurrencySortList() {
      try {
        const { data } = await getLaunchpadCurrencyList()
        this.currencyList = data
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
