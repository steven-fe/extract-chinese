<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" inline label-width="68px">
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" size="mini" @change="getList">
          <el-option :label="$t('common.all')" :value="undefined" />
          <el-option label="锁仓资产" value="1" />
          <el-option label="解锁资产" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="symbol">
        <el-select v-model="queryParams.symbol" size="mini" @change="getList">
          <el-option
            v-for="(item, index) in marginList"
            :key="index"
            :label="item.label"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
        />
      </el-form-item>
      <el-form-item label="用户ID" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户ID"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >
        {{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" border :data="tableList">
      <el-table-column label="时间" align="center" prop="ts">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ts) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type == 1">锁仓资产</span>
          <span v-if="scope.row.type == 2">解锁资产</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" />
      <el-table-column label="用户ID" align="center" prop="uid" />
      <el-table-column label="应执行金额" align="center" prop="expectAmount" />
      <el-table-column
        label="实际执行金额"
        align="center"
        prop="actualAmount"
      />
      <el-table-column :label="$t('financemanager.operator')" align="center" prop="opUser" />
      <el-table-column label="操作备注" align="center" prop="memo">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.memo) }}</span>
        </template>
      </el-table-column>
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
import { listCoin } from '@/api/contract/margin'
import { list, exportList } from '@/api/finance/walletLockPositon'
export default {
  name: '',

  data() {
    return {
      // 币种列表
      marginList: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      tableList: [],
      time: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: undefined,
        symbol: undefined,
        uid: undefined,
        beginTime: undefined,
        endTime: undefined
      }
    }
  },
  created() {
    this.getMarginList()
  },
  mounted() {
    this.queryParams.symbol = this.$route.query.symbol
    if (this.$route.query.type && this.$route.query.ts) {
      this.queryParams.type = this.$route.query.type + ''
      this.time.push(this.$route.query.ts)
      const d = new Date(this.$route.query.ts)
      this.time.push(this.parseTime(d.getTime() + (24 * 3600 * 1000 - 1)))
    }
    this.getList()
  },
  methods: {
    // 币种列表
    getMarginList() {
      this.loading = true
      listCoin().then((response) => {
        if (response.code == 200) {
          const list = response.rows
          list.forEach((element) => {
            this.$set(element, 'label', element.marginCoin)
          })
          this.marginList = [{ label: this.$t('common.all'), marginCoin: undefined }, ...list]
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getList() {
      this.loading = true
      this.queryParams.beginTime = this.time
        ? this.time[0]
          ? this.time[0]
          : undefined
        : undefined
      this.queryParams.endTime = this.time
        ? this.time[1]
          ? this.time[1]
          : undefined
        : undefined
      list(this.queryParams).then((res) => {
        this.tableList = res.rows
        this.loading = false
        this.total = res.total
      })
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 重置按钮操作
    resetQuery() {
      this.time = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleExport() {
      const queryParams = this.queryParams
      queryParams.beginTime = this.time
        ? this.time[0]
          ? this.time[0]
          : undefined
        : undefined
      queryParams.endTime = this.time
        ? this.time[1]
          ? this.time[1]
          : undefined
        : undefined
      this.$confirm('是否导出锁仓记录数据项？', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(res => {
        return exportList(queryParams)
      }).then(res => {
        this.download(res.msg)
      }).catch(e => {
        this.msgError(e)
      })
    }
  }
}
</script>

<style scoped>
</style>
