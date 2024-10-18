<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label prop="currency" label-width="85px">
        <el-select
          v-model="queryParams.currency"
          size="mini"
          filterable
          placeholder="请选择币种"
          @change="selectChange"
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
    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="时间" align="center" prop="txnDate">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.txnDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="做市币种" align="center" prop="currency" />
      <el-table-column label="贡献交易人数" align="center" prop="txnUserNum" />
      <el-table-column label="贡献交易笔数" align="center" prop="txnNum" />
      <el-table-column label="贡献交易金额" align="center" prop="txnAmt" />
      <el-table-column label="贡献手续费" align="center" prop="txnFee" />
      <el-table-column label="下级盈亏" align="center" prop="txnProfitAmt" />
      <el-table-column label="做市收益" align="center" prop="marketProfitAmt" />
      <el-table-column
        label="为平台创造收益"
        align="center"
        prop="platformProfitAmt"
      />
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
import { dailyList } from '@/api/marketgrant/makerDaily'
export default {
  name: '',
  props: ['msg'],
  data() {
    return {
      time: undefined,
      total: 0,
      loading: true,
      queryParams: {
        uid: this.msg.uid,
        currency: undefined,
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      currencyList: []
    }
  },
  created() {
    this.getMarginCoinList()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      dailyList(this.queryParams).then((response) => {
        this.tableData = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getMarginCoinList() {
      this.coininfo = this.msg.currencys
      this.coininfo.forEach((element) => {
        this.$set(element, 'label', element.marginCoin)
      })
      this.currencyList = [
        { marginCoin: undefined, label: this.$t('common.all') },
        ...this.coininfo
      ]
    },
    selectChange() {
      this.getList()
    }
  }
}
</script>

<style scoped>
</style>
