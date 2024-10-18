<template>
  <div class="app-container">
    <h3>{{ queryParams.uid }} 的贡献交易记录列表</h3>
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label prop="goodsId">
        <el-select
          v-model="queryParams.goodsId"
          size="mini"
          filterable
          @change="handleSelectChange"
        >
          <el-option
            v-for="(item, index) in goodsList"
            :key="index"
            :label="item.label"
            :value="item.goodsId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label prop="currency">
        <el-select
          v-model="queryParams.currency"
          size="mini"
          filterable
          @change="handleSelectChange"
        >
          <el-option
            v-for="(item, index) in currencyList"
            :key="index"
            :label="item.label"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="tableList" border>
      <el-table-column label="订单ID" align="center" prop="orderId" />
      <el-table-column label="订单时间" align="center" width="180px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" align="center" width="125px">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false">{{
            scope.row.account
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('frozen.transactionPair')" align="center" prop="goodsId" />
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column label="订单类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.orderType == 1">买涨</span>
          <span v-if="scope.row.orderType == 2">买跌</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.closeType == 1">用户平仓</span>
          <span v-if="scope.row.closeType == 2">系统强平</span>
          <span v-if="scope.row.closeType == 3">止盈止损</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金金额" align="center" prop="openAmount" />
      <el-table-column label="杠杆倍数" align="center" prop="multiple">
        <template slot-scope="scope">
          <span>{{ scope.row.multiple + "X" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成交价格" align="center" prop="closePrice" />
      <el-table-column label="订单总额" align="center" prop="orderAmt" />
      <el-table-column label="订单盈亏" align="center" prop="settleAmount" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listCoinGoods } from '@/api/contract/coin'
import { listCoinMar } from '@/api/contract/margin'
import { markerDealList } from '@/api/marketgrant/marketserial'
export default {
  name: '',
  data() {
    return {
      coininfo: [],
      loading: true,
      queryParams: {
        userId: this.msg,
        goodsId: undefined,
        currency: undefined,
        pageNum: 1,
        pageSize: 10
      },
      tableList: [],
      total: 0,
      goodsList: [],
      currencyList: []
    }
  },
  created() {
    this.getGoodsList()
    this.getMarginLsit()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.uid = this.$route.query.uid
      //   getTransactionList(this.queryParams).then((response) => {
      //     if (response.code == 200) {
      //       this.tableList = response.rows;
      //       this.total = response.total;
      //       this.loading = false;
      //     } else {
      //       this.msgError(response.msg);
      //     }
      //   });
    },
    // 币种列表
    getMarginLsit() {
      listCoinMar().then((res) => {
        this.coininfo = res.rows
        this.coininfo.forEach((element) => {
          this.$set(element, 'label', element.marginCoin)
        })
        this.currencyList = [
          { marginCoin: undefined, label: '全部币种' },
          ...this.coininfo
        ]
      })
    },
    // 币对列表
    getGoodsList() {
      this.loading = true
      listCoinGoods().then((response) => {
        if (response.code == 200) {
          const list = this.unique2(response.rows)
          list.forEach((element) => {
            this.$set(element, 'label', element.goodsId)
          })
          this.goodsList = [
            { goodsId: undefined, label: '全部交易币对' },
            ...list
          ]
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    unique2(arr) {
      const res = new Map()
      return arr.filter(
        (arr) => !res.has(arr.goodsId) && res.set(arr.goodsId, 1)
      )
    },
    handleSelectChange() {
      this.getList()
    }
  }
}
</script>

<style scoped>
</style>
