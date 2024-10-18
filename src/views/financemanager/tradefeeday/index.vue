<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item :label="$t('systemsetting.text90')" prop="instrumentId">
        <el-select v-model="queryParams.instrumentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('contractmanager.date')" prop="time">
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('common.search') }}</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{ $t('common.derive') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      border
      :data="dayList"
    >
      <el-table-column :label="$t('contractmanager.date')" align="center" prop="tradeDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.tradeDate,"{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('usermanage.currencyPair')" align="center" prop="symbol" />
      <el-table-column :label="$t('financemanager.baseCurrencyFee')" align="center" prop="baseFee">
        <template slot-scope="scope">
          <span>{{ scope.row.baseFee }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.baseConversionFee')" align="center" prop="baseFeeUsdt">
        <template slot-scope="scope">
          <span>{{ scope.row.baseFeeUsdt }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.quoteCurrencyCommission')" align="center" prop="quoteFee">
        <template slot-scope="scope">
          <span>{{ scope.row.quoteFee }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.quoteConversionFee')" align="center" prop="quoteFeeUsdt">
        <template slot-scope="scope">
          <span>{{ scope.row.quoteFeeUsdt }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.grossCommission')" align="center" prop="feeUsdt">
        <template slot-scope="scope">
          <span>{{ scope.row.feeUsdt }}</span>
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
import { mapState, mapActions } from 'vuex'
import { listDay, exportDay } from '@/api/operate/tradefeeday'

export default {
  name: 'Day',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 充值统计表格数据
      dayList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        instrumentId: '',
        beginTime: undefined,
        endTime: undefined
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList']),
    currencyOptions() {
      return this.pairList
    }
  },
  created() {
    this.getPair()
    this.getList()
  },
  methods: {
    ...mapActions('systemsetting', ['getPair']),
    /** 查询充值统计列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listDay(this.queryParams).then(response => {
        this.dayList = response.rows
        this.total = response.total
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
      this.$confirm(this.$t('financemanager.confirmWhetherToExportTransactionFeeStatistics'), this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportDay(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    }

  }
}
</script>
