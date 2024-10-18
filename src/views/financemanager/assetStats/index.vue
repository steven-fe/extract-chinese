<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        :label="$t('common.coin')"
        prop="symbol"
      >
        <el-select
          v-model="queryParams.symbol"
          size="mini"
          filterable
          clearable
          placeholder="请选择币种"
        >
          <el-option
            v-for="(item,index) in coinList"
            :key="index"
            :label="item.currency"
            :value="item.currency"
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
        >{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      border
      :data="tableList"
    >
      <el-table-column
        label="日期"
        align="center"
        prop="statsDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.statsDate,"{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.coin')"
        align="center"
        prop="symbol"
      />
      <el-table-column
        label="提币"
        align="center"
        prop="withdraw"
      />
      <el-table-column
        label="充值"
        align="center"
        prop="deposit"
      />
      <el-table-column
        label="余额"
        align="center"
        prop="balance"
      />
      <el-table-column
        label="差额"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ algorithmSub(scope.row.balance,(algorithmSub(scope.row.deposit,scope.row.withdraw))) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="用户总余额"
        align="center"
        prop="userBalance"
      />
      <el-table-column
        label="系统总余额"
        align="center"
        prop="sysBalance"
      />
      <el-table-column
        label="总资产"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ algorithmAdd(scope.row.userBalance,scope.row.sysBalance) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listSupportTokenByType } from '@/api/coin'
import { assetBackuplist } from '@/api/finance/assetStats'

export default {
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      tableList: [],
      selectSymbol: undefined,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        symbol: '全部',
        beginTime: undefined,
        endTime: undefined
      },
      coinList: [{ currency: '全部' }]
    }
  },
  created() {
    this.getCoinList()
  },
  methods: {
    /** 查询提现统计列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      this.queryParams.symbol =
        this.queryParams.symbol == '全部' ? '' : this.queryParams.symbol
      this.selectCurrency(this.queryParams.symbol)
      assetBackuplist(this.queryParams).then((response) => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
        this.queryParams.symbol =
          this.queryParams.symbol == '' ? '全部' : this.queryParams.symbol
      })
    },
    getCoinList() {
      listSupportTokenByType()
        .then((response) => {
          if (response.code == 200) {
            this.coinList = [...this.coinList, ...response.rows]
            this.queryParams.symbol = this.coinList[0].currency
            this.getList()
          } else {
            this.coinList = []
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    selectCurrency(val) {
      this.selectSymbol = val
    }
  }
}
</script>
