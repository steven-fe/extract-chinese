<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item :label="$t('systemsetting.transactionCurrency')" prop="baseSymbol">
        <el-select v-model="queryParams.baseSymbol" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in coinList"
            :key="item.id"
            :label="item.name"
            :value="item.name"
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

    <el-table v-loading="loading" border :data="rateList">
      <el-table-column :label="$t('contractmanager.date')" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime,"{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('usermanage.currencyPair')" align="center" prop="symbol" />
      <el-table-column :label="$t('systemsetting.transactionCurrency')" align="center" prop="baseSymbol" />
      <el-table-column :label="$t('systemsetting.denominationCurrency')" align="center" prop="quoteSymbol" />
      <el-table-column :label="$t('systemsetting.closingPriceOfTheDay')" align="center" prop="rate" />
      <el-table-column :label="$t('systemsetting.text21')" align="center" prop="urate">
        <template slot-scope="scope">
          <span>{{ scope.row.urate }}</span>
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
import {
  listSymbolRateDay,
  exportSymbolRateDay
} from '@/api/system/symbolRate'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      isDisabled: false,
      // 汇率记录表格数据
      rateList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        baseSymbol: '',
        beginTime: undefined,
        endTime: undefined
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    coinList() {
      return this.currencyList
    }
  },
  created() {
    this.getCurrency(1)
    this.getList()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    /** 查询汇率记录列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listSymbolRateDay(this.queryParams).then(response => {
        this.rateList = response.rows
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
      this.$confirm(this.$t('systemsetting.text22'), this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportSymbolRateDay(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
