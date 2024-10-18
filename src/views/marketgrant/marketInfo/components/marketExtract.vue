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
      <el-table-column label="申请时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column label="申请充值金额" align="center" prop="withdrawAmt" />
      <el-table-column :label="$t('common.status')" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 0">待审核</span>
          <span v-if="scope.row.status == 1">审核通过</span>
          <span v-if="scope.row.status == 9">审核拒绝</span>
        </template>
      </el-table-column>
      <el-table-column label="审核备注" align="center" prop="remark" />
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
import { list } from '@/api/marketgrant/marketwithdraw'
export default {
  name: '',
  props: ['msg'],
  data() {
    return {
      time: undefined,
      total: 0,
      loading: true,
      queryParams: {
        currency: undefined,
        pageNum: 1,
        like: this.msg.uid,
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
      list(this.queryParams).then((response) => {
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
