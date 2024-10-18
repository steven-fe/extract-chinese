<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="币种：" prop="coinSymbol">
        <el-select v-model="queryParams.coinSymbol" placeholder="请选择币种" clearable size="mini">
          <el-option v-for="item in coinSymbols" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期：" prop="time">
        <el-date-picker v-model="time" type="month" placeholder="选择月份" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" border :data="monthList">
      <el-table-column label="日期" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.statsYear+"/"+scope.row.statsMonth }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="coinSymbol" />
      <el-table-column label="本期发生" width="150" align="center">
        <el-table-column label="收入" align="center" prop="termIncome" />
        <el-table-column label="支出" align="center" prop="termOut" />
      </el-table-column>
      <el-table-column label="本年累计" width="150" align="center">
        <el-table-column label="收入" align="center" prop="yearTotalIncome" />
        <el-table-column label="支出" align="center" prop="yearTotalOut" />
      </el-table-column>
      <el-table-column label="期末余额" align="center" prop="termBalance" />
      <el-table-column label="USDT汇率" align="center" prop="rate" />
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
import { listMonth, exportMonth, queryParams } from '@/api/monthbalance'

export default {
  name: 'Month',
  data() {
    return {
      // 遮罩层
      loading: true,
      coinSymbols: [],
      // 总条数
      total: 0,
      // 币种余额表格数据
      monthList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      time: '',
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        coinSymbol: undefined,
        statsYear: undefined,
        statsMonth: undefined
      },
      // 表单参数
      form: {}
    }
  },
  created() {
    this.getList()
    this.getQueryList()
  },
  methods: {
    /** 查询币种余额列表 */
    getList() {
      this.loading = true
      if (this.time != '') {
        this.queryParams.statsYear = this.time.getFullYear()
        this.queryParams.statsMonth = this.time.getMonth() + 1
      }

      listMonth(this.queryParams).then(response => {
        this.monthList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getQueryList() {
      queryParams().then(response => {
        this.coinSymbols = response.data
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有币种余额数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportMonth(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
