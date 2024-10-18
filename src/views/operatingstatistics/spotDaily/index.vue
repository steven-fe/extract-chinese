<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item :label="$t('common.coin')" prop="currencyId">
        <el-select v-model="form.currencyId" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')" filterable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
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
      <!--      <el-table-column-->
      <!--        type="selection"-->
      <!--        width="55">-->
      <!--      </el-table-column>-->
      <el-table-column prop="censusDateStr" label="日期" width="200px" align="center" />
      <el-table-column prop="currencyCode" :label="$t('common.coin')" align="center" />
      <!--      <el-table-column prop="dayTradingNumber" label="当日交易人数" align="center"></el-table-column>-->
      <el-table-column label="当日交易人数" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.currencyCode === 'usdt'">
            -
          </div>
          <div v-else>
            {{ scope.row.dayTradingNumber }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="累计交易人数" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.currencyCode === 'usdt'">
            -
          </div>
          <div v-else>
            {{ scope.row.totalTradingNumber }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="depositNumber" width="200px" label="充值数量" align="center" />
      <el-table-column prop="depositAmount" width="200px" label="充值金额(U)" align="center" />
      <el-table-column prop="withdrawalNumber" width="200px" label="提现数量" align="center" />
      <el-table-column prop="withdrawalAmount" width="200px" label="提现金额(U)" align="center" />
      <el-table-column label="当日交易金额(U)" width="200px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.currencyCode === 'usdt'">
            -
          </div>
          <div v-else>
            {{ scope.row.dayTradingAmount }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Base-手续费数量" width="200px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.currencyCode == 'usdt'">
            -
          </div>
          <div v-else>
            {{ scope.row.baseFee }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Quote-手续费数量" width="200px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.currencyCode === 'usdt'">
            -
          </div>
          <div v-else>
            {{ scope.row.quotcFee }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="当日手续费金额(U)" width="200px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.currencyCode === 'usdt'">
            -
          </div>
          <div v-else>
            {{ scope.row.dayFeeAmount }}
          </div>
        </template>
      </el-table-column>
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
import { pageList, exportData } from '@/api/spot/spotDaily'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SpotDailyPageList',
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
        currencyId: ''
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
    this.getConfigList()
    this.getCurrency()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 导出
    exportData() {
      exportData(this.form).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: '导出成功'
          })
        }
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
      pageList(this.form).then(response => {
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
