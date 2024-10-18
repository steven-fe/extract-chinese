<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评定类型" prop="evaluateType">
        <el-select v-model="queryParams.evaluateType" clearable size="mini" placeholder="请选择评定类型">
          <el-option
            v-for="(item, index) in evaluateTypes"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="retentionList" border>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="评定类型" align="center" prop="evaluateType">
        <template slot-scope="scope">
          <span v-if="scope.row.evaluateType == 4">抵押升级</span>
          <span v-else-if="scope.row.evaluateType == 3">消耗升级</span>
          <span v-else-if="scope.row.evaluateType == 2">操作员评定</span>
          <span v-else>系统评定</span>
        </template>
      </el-table-column>
      <el-table-column label="连续未达标次数 " align="center" prop="noConformanceNum" />
      <el-table-column label="原有身份等级" align="center" prop="levelIdOld">
        <template slot-scope="scope">
          <span v-for="(item,key) in selectList" :key="key">
            <span v-if="item.levelId==scope.row.levelIdOld">{{ item.levelName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="当前身份等级" align="center" prop="levelId">
        <template slot-scope="scope">
          <span v-for="(item,key) in selectList" :key="key">
            <span v-if="item.levelId==scope.row.levelId">{{ item.levelName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="记录修改时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改操作员" align="center" prop="muser" />
      <el-table-column label="消耗/抵押币种" align="center" prop="costCoin" />
      <el-table-column label="周期" align="center" prop="period">
        <template slot-scope="scope">
          <span v-if="scope.row.period != null">{{ scope.row.period }}天</span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" prop="startDate">
        <template slot-scope="scope">
          <span v-if="scope.row.startDate != null">{{ getDateYMD(scope.row.startDate, '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" prop="endDate">
        <template slot-scope="scope">
          <span v-if="scope.row.endDate != null">{{ getDateYMD(scope.row.endDate, '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消耗额" align="center" prop="costAmount" />
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
import { listRetention } from '@/api/invitation/invitationUserLevelRetention'
import { listLevel } from '@/api//invitation/invitationlevel'

export default {
  name: 'InvitationUserLevelRetention',
  data() {
    return {
      // 总条数
      total: 0,
      selectList: [],
      // 用户身份等级修改日志表格数据
      retentionList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        evaluateType: undefined
      },
      evaluateTypes: [
        { value: 1, label: '系统评定' },
        { value: 2, label: '操作员评定' },
        { value: 3, label: '消耗升级' },
        { value: 4, label: '抵押升级' }
      ]
    }
  },
  created() {
    this.getSelect()
    this.getList()
  },
  methods: {
    /** 查询用户身份等级修改日志列表 */
    getList() {
      this.loading = true
      listRetention(this.queryParams).then((response) => {
        this.retentionList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getSelect() {
      this.loading = true
      listLevel().then((response) => {
        this.selectList = response.rows
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
