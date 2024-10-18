<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item :label="$t('common.coin')" prop="currencyName">
        <el-select v-model="form.currencyName" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="time">
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getList">{{$t('common.search')}}</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格数据 -->
    <el-table
      :data="dayList"
      border
      style="width: 100%"
      class="table cabin-table"
      show-summary
      :summary-method="getSum"
    >
      <el-table-column label="日期" align="center" prop="createdDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dataTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="hairEnvelopeNum" label="发红包次数" align="center" />
      <el-table-column prop="hairEnvelopePeople" width="100" label="发红包人数" align="center" />
      <el-table-column prop="collarEnvelopeNum" label="领红包次数" align="center" />
      <el-table-column prop="collerEnvelopePeople" width="170" label="领红包人数" align="center" />
      <el-table-column prop="newCollerEnvelopePeople" width="170" label="新用户领红包人数" align="center" />
      <el-table-column prop="hairMostUserUid" width="170" label="发红包最多用户（UID）" align="center" />
      <el-table-column prop="hairMostCurrency" width="170" label="发红包最多（币种）" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getConfigList"
      />
    </div>
  </div>
</template>
<script>
import * as API from '@/api/redenvelope/redenvelopestatistics'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Redenvelopestatistics',
  data() {
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    var checkNumber1 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    return {
      pageShow: true,
      total: 0,
      summaryRows: {},
      form: {
        currencyName: '',
        sTime: undefined,
        eTime: undefined,
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      time: undefined,
      open: false,
      digform: {
        currencyName: '',
        state: '',
        currencyMinVolume: '',
        currencyMaxVolume: '',
        redEnvelopeMax: ''
      }
    }
  },
  computed: {
    ...mapState('redenvelope', ['redEnvelopeCurrencyList']),
    codeOptions() {
      return this.redEnvelopeCurrencyList
    }
  },
  // 初始化
  mounted() {
    this.getList()
    this.getRedEnvelopeCurrency()
  },
  methods: {
    ...mapActions('redenvelope', ['getRedEnvelopeCurrency']),
    /** 查询红包统计列表 */
    getList() {
      this.loading = true
      this.form.sTime = (this.time && this.time[0]) || ''
      this.form.sTime = this.form.sTime ? new Date(this.form.sTime + ' 00:00:00').getTime() : this.form.sTime
      this.form.eTime = (this.time && this.time[1]) || ''
      this.form.eTime = this.form.eTime ? new Date(this.form.eTime + ' 23:59:59').getTime() : this.form.eTime
      API.listDay(this.form).then(response => {
        this.dayList = response.rows
        this.total = response.total
        this.summaryRows = response.summaryRows
        this.loading = false
      })
    },
    getSum(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        // 排除不需要合计的列
        if (column.property === 'hairMostUserUid' || column.property === 'hairMostCurrency') {
          return
        }
        sums[index] = this.summaryRows[column.property]
      })
      return sums
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出红包统计数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return API.exportDay(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {
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
</style>
