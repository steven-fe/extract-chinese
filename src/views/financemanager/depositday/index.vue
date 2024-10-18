<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item :label="$t('common.coin')" prop="name">
        <el-select v-model="queryParams.symbol" size="mini" filterable :placeholder="$t('common.selectCurrency')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="(item,index) in coinList"
            :key="index"
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

    <el-table
      v-loading="loading"
      border
      :data="dayList"
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column :label="$t('contractmanager.date')" align="center" prop="createdDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdDate,"{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" />
      <el-table-column :label="$t('dwmanager.rechargeAmount')" align="center" prop="depAmount">
        <template slot-scope="scope">
          <span>{{ scope.row.depAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.arrivalAmount')" align="center" prop="intoAmount">
        <template slot-scope="scope">
          <span>{{ scope.row.intoAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.numberOfRechargePens')" align="center" prop="depCount" />
      <el-table-column :label="$t('financemanager.numberOfSuccessfulStrokes')" align="center" prop="succCount" />
      <el-table-column :label="$t('financemanager.topUpUsers')" align="center" prop="userCount" />
      <el-table-column :label="$t('financemanager.maximumRechargeUserId')" align="center" prop="maxUid" />
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
import { listDay, exportDay } from '@/api/operate/depositday'

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
        symbol: '',
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
    /** 查询充值统计列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      this.selectCurrency(this.queryParams.symbol)
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
      this.$confirm(this.$t('financemanager.confirmWhetherToExportRechargeStatistics'), this.$t('common.alert'), {
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
    },
    getSummaries(param) {
      if (this.selectSymbol != '') {
        const { columns, data } = param
        const sums = []
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '合计'
          } else if (index != 7 && index != 1) {
            const values = data.map(item => Number(item[column.property]))
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr)
                if (!isNaN(value)) {
                  return this.addLong(prev, curr)
                } else {
                  return prev
                }
              }, 0)
            }
          } else if (index == 7) {
            sums[index] = '--'
          } else {
            sums[index] = this.selectSymbol
          }
        })
        return sums
      } else {
        return false
      }
    },
    selectCurrency(val) {
      this.selectSymbol = val
    }
  }
}
</script>
