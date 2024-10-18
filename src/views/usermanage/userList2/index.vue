<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item prop="type">
        <el-select v-model="queryParams.type" size="mini" style="width: 100px">
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="account">
        <el-input v-model="queryParams.account" placeholder="模糊查询" size="mini" clearable />
      </el-form-item>
      <el-form-item label="用户分类ID" prop="classCode" label-width="100px">
        <el-input v-model="queryParams.classCode " placeholder="请输入用户分类ID" size="mini" clearable />
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column prop="sort" width="75px" label="序号" />
      <el-table-column prop="regTime" label="注册时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.regTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="uid" label="userId">
        <template slot-scope="scope">
          <span>{{ scope.row.uid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dwmanager.userUID')">
        <template slot-scope="scope">
          <span v-if="scope.row.userId">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.userId }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="accountType" label="账号类型">
        <template slot-scope="scope">
<!--          0:普通账号 1:主账号 2:子账号-->
          <span v-if="scope.row.accountType === 0">普通账号</span>
          <span v-if="scope.row.accountType === 1">主账号</span>
          <span v-if="scope.row.accountType === 2">子账号</span>
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
          <span v-if="scope.row.userRealName">{{ scope.row.userRealName }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="用户分类ID">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.classCode"
            type="primary"
            :underline="false"
            @click="() => $router.push({ name: 'userCategoryDetail', query: { id: scope.row.classId } })"
          >{{ scope.row.classCode }}</el-link>
          <span v-else>--</span>
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
import { listUserInfo, exportUserInfo } from '@/api/user'
export default {
  name: 'UserList2',

  data() {
    return {
      total: 0,
      loading: true,
      tableData: [],
      time: undefined,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: 1, // 1: 用户UID  2:邮箱 3:手机号 4:userID
        account: undefined,
        classCode: undefined,
        startTime: undefined,
        endDate: undefined
      },
      typeList: [
        { value: 1, label: this.$t('dwmanager.userUID')},
        { value: 2, label: '邮箱' },
        { value: 3, label: '手机号' },
        { value: 4, label: 'userID' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 用户列表
    getList() {
      this.loading = true
      this.queryParams.startTime = (this.time && this.time[0]) || undefined
      this.queryParams.endTime = (this.time && this.time[1]) || undefined
      listUserInfo(this.queryParams)
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
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出用户数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportUserInfo(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
</style>
