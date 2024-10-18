<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" inline label-width="70px">
      <el-form-item :label="$t('common.coin')" prop="symbol">
        <el-select v-model="queryParams.symbol" size="mini">
          <el-option
            v-for="(item, index) in marginList"
            :key="index"
            :label="item.label"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计日期" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="daterange"
          :range-separator="$t('common.toTime')"
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
        >
          搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" border :data="tableList">
      <el-table-column label="日期" align="center" prop="ts">
        <template
          slot-scope="scope"
        >{{ parseTime(scope.row.ts, "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" />
      <el-table-column label="当前锁仓金额" align="center" prop="nowAmount">
        <template slot-scope="scope">
          <el-link v-if="scope.row.nowAmount" type="primary" :underline="false" @click="toLockPosition(scope.row,1)">
            {{ scope.row.nowAmount }}
          </el-link>
          <span v-else>0</span>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column
        label="今日新增锁仓"
        align="center"
        prop="todayLockAmount"
      >
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" @click="toLockPosition(scope.row,2)">
            {{ scope.row.todayLockAmount }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="今日新增解锁"
        align="center"
        prop="todayUnlockAmount"
      >
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" @click="toLockPosition(scope.row,3)">
            {{ scope.row.todayUnlockAmount }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="当前锁仓用户数" align="center" prop="lockUsers">
        <template slot-scope="scope">
          <span v-if="scope.row.lockUsers">{{ scope.row.lockUsers }}</span>
          <span v-else>0</span>
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
import { list, exportList } from '@/api/finance/walletLockStatistic'
import { listCoin } from '@/api/contract/margin'
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
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        symbol: undefined,
        beginTime: undefined,
        endTime: undefined
      }
    }
  },
  created() {
    this.getMarginList()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.beginTime = this.time ? this.time[0] : undefined
      this.queryParams.endTime = this.time ? this.time[1] : undefined
      list(this.queryParams).then((res) => {
        this.tableList = res.rows
        this.total = res.total
        this.loading = false
      })
    },
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
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 重置按钮操作
    resetQuery() {
      this.time = undefined
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 跳转
    toLockPosition(row, type) {
      switch (type) {
        case 1:
          this.$router.push({
            name: 'walletLockPosition',
            query: { symbol: row.symbol }
          })
          break
        case 2:
          this.$router.push({
            name: 'walletLockPosition',
            query: { symbol: row.symbol, type: 1, ts: row.ts }
          })
          break
        case 3:
          this.$router.push({
            name: 'walletLockPosition',
            query: { symbol: row.symbol, type: 2, ts: row.ts }
          })
          break
      }
    },
    // 导出
    handleExport() {
      const queryParams = this.queryParams
      queryParams.beginTime = this.time ? this.time[0] : undefined
      queryParams.endTime = this.time ? this.time[1] : undefined
      this.$confirm('是否确认导出锁仓统计数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportList(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>

<style scoped>
</style>
