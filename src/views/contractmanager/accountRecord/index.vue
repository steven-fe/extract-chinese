<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item :label="$t('common.accountType')" prop="uid">
        <el-select
          v-model="queryParams.uid"
          clearable
          size="mini"
          placeholder="请选择账户类型"
        >
          <el-option
            v-for="(item, index) in typeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currency">
        <el-select
          v-model="queryParams.currency"
          clearable
          size="mini"
          placeholder="请选择币种"
        >
          <el-option
            v-for="(item, index) in marList"
            :key="index"
            :label="item.label"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="变更时间" prop="time">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="tableList" border>
      <el-table-column label="变更时间" align="center" prop="ctime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="变更类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.transferType == 1">提取利润</span>
          <span v-if="scope.row.transferType == 2">增加余额</span>
        </template>
      </el-table-column>
      <el-table-column label="账号类型" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in typeList" :key="index">
            <span v-if="item.value == scope.row.sysAcct">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column label="变更金额" align="center" prop="amount" />
      <el-table-column label="提取至/资金来源" align="center" prop="uid" />
      <el-table-column label="操作备注" align="center" prop="applyRemark">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.applyRemark) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="load"
    />
  </div>
</template>

<script>
import { listCoinMar } from '@/api/contract/margin'
import { listRecord, exportRecord } from '@/api/contract/accountConfirm'
export default {
  name: '',

  data() {
    return {
      // 遮罩层
      loading: true,
      total: 0,
      // 总条数
      tableList: [],
      marList: [],
      time: undefined,
      // 查询参数
      queryParams: {
        uid: undefined,
        currency: undefined,
        beginTime: undefined,
        endTime: undefined,
        pageNum: 1,
        pageSize: 20
      },
      rules: {},
      typeList: [
        { value: undefined, label: this.$t('common.all') },
        { value: 1, label: '划转记账账户' },
        { value: 2, label: '平仓账户' },
        { value: 3, label: '手续费账户' },
        { value: 4, label: '资金费用账户' },
        { value: 5, label: '隔夜费账户' },
        { value: 6, label: '营销账户' },
        { value: 7, label: '相互保资金' },
        { value: 8, label: '相互保收益' },
        { value: 9, label: '返佣消耗' },
        { value: 10, label: '兑换账户' },
        { value: 11, label: '回购账户' }
      ]
    }
  },
  created() {
    this.load()
    this.getMarList()
  },
  methods: {
    load() {
      this.loading = true
      this.queryParams.beginTime = this.time ? this.time[0] : undefined
      this.queryParams.endTime = this.time ? this.time[1] : undefined
      listRecord(this.queryParams).then((response) => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 保证金币种
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            const list = response.rows
            list.forEach((element) => {
              this.$set(element, 'label', element.marginCoin)
            })
            this.marList = [{ label: this.$t('common.all'), marginCoin: undefined }, ...list]
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleQuery() {
      this.load()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.load()
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出资产变更记录数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportRecord(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function(error) {})
    }
  }
}
</script>

<style scoped>
</style>
