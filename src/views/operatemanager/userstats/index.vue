<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="日期：" prop="time">
        <el-date-picker
          v-model="queryParams.time"
          size="mini"
          type="daterange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="tableList" show-summary>
      <el-table-column label="日期" align="center" prop="createdDate">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdDate,"{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录用户数" align="center" prop="loginCount">
        <template slot-scope="scope">
          <span v-if="scope.row.loginCount == null">0</span>
          <span v-else>{{ scope.row.loginCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册用户数" align="center" prop="regCount">
        <template slot-scope="scope">
          <span v-if="scope.row.regCount == null">0</span>
          <span v-else>{{ scope.row.regCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="高级认证用户数" align="center" prop="kyc2faCount">
        <template slot-scope="scope">
          <span v-if="scope.row.kyc2faCount == null">0</span>
          <span v-else>{{ scope.row.kyc2faCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="初级认证用户数" align="center" prop="kycCount">
        <template slot-scope="scope">
          <span v-if="scope.row.kycCount == null">0</span>
          <span v-else>{{ scope.row.kycCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="首次充值用户数" align="center" prop="depositCnt">
        <template slot-scope="scope">
          <span v-if="scope.row.depositCnt == null">0</span>
          <span v-else>{{ scope.row.depositCnt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="首次提币用户数" align="center" prop="withdrawCnt">
        <template slot-scope="scope">
          <span v-if="scope.row.withdrawCnt == null">0</span>
          <span v-else>{{ scope.row.withdrawCnt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值用户数" align="center" prop="depositUsers">
        <template slot-scope="scope">
          <span v-if="scope.row.depositUsers == null">0</span>
          <span v-else>{{ scope.row.depositUsers }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提币用户数" align="center" prop="withdrawUsers">
        <template slot-scope="scope">
          <span v-if="scope.row.withdrawUsers == null">0</span>
          <span v-else>{{ scope.row.withdrawUsers }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合约交易用户数" align="center" prop="cfdOrderUserCnt">
        <template slot-scope="scope">
          <span v-if="scope.row.cfdOrderUserCnt == null">0</span>
          <span v-else>{{ scope.row.cfdOrderUserCnt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合约交易笔数" align="center" prop="cfdOrderTransCnt">
        <template slot-scope="scope">
          <span v-if="scope.row.cfdOrderTransCnt == null">0</span>
          <span v-else>{{ scope.row.cfdOrderTransCnt }}</span>
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
import { findListUserStats } from '@/api/user'
import { date } from '@/utils/format'
export default {
  data() {
    return {
      total: 0,
      loading: false,
      tableList: [],
      queryParams: {
        time: undefined,
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleQuery() {
      this.getList()
    },
    getList() {
      this.loading = true
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        beginTime: this.queryParams.time
          ? this.queryParams.time[0]
          : date(new Date()),
        endTime: this.queryParams.time
          ? this.queryParams.time[1]
          : date(new Date())
      }
      findListUserStats(params).then(response => {
        this.tableList = response.rows
        // this.tableList.forEach(element => {
        //   if (element.createdDate) {
        //     element.createdDate = element.createdDate.substring(0, 10);
        //   }
        // });
        this.total = response.total
        this.loading = false
      })
    }
  }
}
</script>
