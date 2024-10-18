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
      <el-table-column label="时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column label="类型" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type == 1">做市盈亏</span>
          <span v-if="scope.row.type == 2">转入</span>
          <span v-if="scope.row.type == 3">提取</span>
          <span v-if="scope.row.type == 4">冻结</span>
          <span v-if="scope.row.type == 5">解冻</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" align="center" prop="amount" />
      <el-table-column label="余额" align="center" prop="toBal" />
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
import { list } from '@/api/marketgrant/marketserial'
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
        uid: this.msg.uid,
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
