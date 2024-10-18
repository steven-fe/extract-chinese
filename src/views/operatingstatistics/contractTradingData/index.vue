<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="合约币对:" prop="contractId">
        <el-select v-model="form.contractId" style="width: 100%" placeholder="请选择币对代码" filterable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in symbolOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="起始时间：">
        <el-date-picker
          v-model="date"
          type="datetime"
          :start-placeholder="$t('common.startTime')"
          align="right"
          value-format="timestamp"
          @change="timeChange1"
        />
      </el-form-item>
      <el-form-item label="结束时间：">
        <el-date-picker
          v-model="date1"
          type="datetime"
          start-placeholder="结束日期"
          align="right"
          value-format="timestamp"
          @change="timeChange2"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">查找</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportData">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table" @selection-change="handleSelectionChange">
      <el-table-column prop="censusDateStr" label="日期" width="200px" align="center" />
      <el-table-column prop="symbol" label="币对" width="200px" align="center" />
      <el-table-column prop="todayTradingNumber" width="200px" label="当日交易笔数" align="center" />
      <el-table-column prop="totalTradingNumber" width="200px" label="总交易笔数" align="center" />
      <el-table-column prop="todayTradingZhangNumber" width="200px" label="当日交易张数" align="center" />
      <el-table-column prop="totalTradingZhangNumber" width="200px" label="总交易张数" align="center" />
      <el-table-column prop="todayTradingAmount" width="200px" label="当日交易金额（u）" align="center" />
      <el-table-column prop="todayTradingAmountQuantitative" width="200px" label="当日交易金额-去量化(U)" align="center" />
      <el-table-column prop="todayTradingPeople" width="200px" label="当日交易人数" align="center" />
      <el-table-column prop="totalTradingPeople" width="200px" label="历史交易总人数" align="center" />
      <el-table-column prop="positionNumber" width="200px" label="持仓人数" align="center" />
      <el-table-column prop="todayBurstPeopleNumber" width="200px" label="当日爆仓人数" align="center" />
      <el-table-column prop="totalBurstPeopleNumber" width="200px" label="爆仓总人数" align="center" />
      <el-table-column prop="todayBurstNumber" width="200px" label="当日爆仓次数" align="center" />
      <el-table-column prop="totalBurstNumber" width="200px" label="爆仓总次数" align="center" />
      <el-table-column prop="toadyBurstAmount" width="200px" label="当日爆仓额" align="center" />
      <el-table-column prop="totalBurstAmount" width="200px" label="爆仓总金额" align="center" />
      <el-table-column prop="insuranceFundBalance" width="200px" label="保险基金余额" align="center" />
      <el-table-column prop="totalPositionZhangNumber" width="200px" label="持仓总张数" align="center" />
      <el-table-column prop="totalPositionAmount" width="200px" label="持仓总金额(U)" align="center" />
      <el-table-column prop="positionMargin" width="200px" label="持仓占用保证金" align="center" />
      <el-table-column prop="positionMarginScale" width="200px" label="持仓总金额/持仓占用保证金" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import { tradingPageList, tradingExportData, getSymbol } from '@/api/contract/contractDaily'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapState } from 'vuex'

export default {
  name: 'ContractTradingPageList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    return {
      symbolOptions: [],
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },

      total: 0,
      configId: '',
      updateId: '',
      form: {
        pageNum: 1,
        pageSize: 10,
        contractId: ''
      },
      date: '',
      date1: '',
      tableData: [{}],
      open: false,
      selectArr: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },

  mounted() {
    this.getSymbol()
    this.getConfigList()
  },
  methods: {
    // 导出
    exportData() {
      tradingExportData(this.form).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: '导出成功'
          })
        }
      })
    },
    // 获取币对信息
    getSymbol() {
      this.loading = true
      getSymbol(this.queryParams)
        .then((response) => {
          if (response.code == 200) {
            response.data.forEach(item => {
              const obj = {
                label: item.symbol,
                value: item.symbolId
              }
              this.symbolOptions.push(obj)
            })
            this.loading = false
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 表格复选框选中方法
    handleSelectionChange(val) {
      this.selectArr = []
      const arr = val.filter(el => {
        return el.status.toString() !== '1'
      })
      const arr1 = val.filter(el => {
        return el.status.toString() === '1'
      })
      if (arr && arr.length > 0) {
        this.$message({
          type: 'warning',
          message: '选中项中有审核过的项, 审批时会忽略审核过的项',
          duration: 3000
        })
      }
      arr1.forEach(el => {
        this.selectArr.push(el.id)
      })
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 开始日期改变事件
    timeChange1(val) {
      if (val) {
        this.form.startTime = val
        return
      }
      this.form.startTime = ''
    },
    // 结束日期改变事件
    timeChange2(val) {
      if (val) {
        this.form.endTime = val
        return
      }
      this.form.endTime = ''
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      tradingPageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .table {
    margin-top: 20px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 50% 50%;
    margin-left: 5%;
    .grid-item {
      width: 90%;
    }
  }
  .upload-demo {
    float: left;
    width: 100%;
  }
</style>
