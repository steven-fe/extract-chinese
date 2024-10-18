<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户账号" prop="account">
        <el-input
          v-model="queryParams.account"
          placeholder="模糊查询"
          size="mini"
          clearable
        />
      </el-form-item>
      <el-form-item label="注册时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
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
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column
        type="index"
        width="75px"
        label="序号"
        :index="indexMethod"
      />
      <el-table-column prop="regTime" label="注册时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.regTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID">
        <template slot-scope="scope">
          <span v-if="scope.row.uid">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.uid }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱号">
        <template slot-scope="scope">
          <span v-if="scope.row.email">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.email }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号">
        <template slot-scope="scope">
          <span v-if="scope.row.phone">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.phone }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名">
        <template slot-scope="scope">
          <span v-if="scope.row.userRealName">{{
            scope.row.userRealName
          }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="用户身份">
        <template slot-scope="scope">
          <span v-if="scope.row.underwriterFlag == 0">普通用户</span>
          <span v-else>承销商</span>
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
import { expUserList, exportUserList } from '@/api/contract/expConfig'
export default {
  data() {
    return {
      total: 0,
      loading: true,
      tableData: [],
      time: undefined,
      queryParams: {
        expId: undefined,
        pageNum: 1,
        pageSize: 10,
        account: undefined,
        beginTime: undefined,
        endDate: undefined
      }
    }
  },
  mounted() {
    this.queryParams.expId = this.$route.query.expId
    this.getList()
  },
  methods: {
    // 用户列表
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || undefined
      this.queryParams.endTime = (this.time && this.time[1]) || undefined
      expUserList(this.queryParams)
        .then((response) => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 详情跳转
    toUserInfo(row) {
      sessionStorage.setItem('uid', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.handleQuery()
    },
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出导出指定用户列表数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportUserList(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function(error) {
          this.msgError(error)
        })
    },
    // 索引值
    indexMethod(index) {
      return (
        index + (this.queryParams.pageNum - 1) * this.queryParams.pageSize + 1
      )
    }
  }
}
</script>

<style scoped>
</style>
