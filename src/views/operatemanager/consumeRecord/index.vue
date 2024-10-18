<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保证金币种" prop="costCoin">
        <el-select v-model="queryParams.costCoin" placeholder="请选择保证金币种" clearable size="mini">
          <el-option
            v-for="(item, index) in marList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="升级类型" prop="upgradeType">
        <el-select v-model="queryParams.upgradeType" placeholder="请选择升级类型" clearable size="mini">
          <el-option
            v-for="(item, index) in upgradeTypeOptions"
            :key="item.upgradeType"
            :label="item.typeName"
            :value="item.upgradeType"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="recordList" border>
      <el-table-column label="用户ID" align="center" prop="userId" width="120px" />
      <el-table-column label="升级类型" align="center" prop="upgradeType">
        <template slot-scope="scope">
          <span v-if="scope.row.upgradeType == 2">抵押</span>
          <span v-else-if="scope.row.upgradeType == 1">消耗</span>
          <span v-else-if="scope.row.upgradeType == 0">赎回</span>
        </template>
      </el-table-column>
      <el-table-column label="消耗额" align="center" prop="costAmount" />
      <el-table-column label="保证金币种" align="center" prop="costCoin" width="90px" />
      <el-table-column label="开始日期" align="center" prop="userAfter.startDate" width="100px">
        <template slot-scope="scope">
          <span v-if="scope.row.userAfter.startDate != null">{{ getDateYMD(scope.row.userAfter.startDate, '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" prop="userAfter.endDate" width="100px">
        <template slot-scope="scope">
          <span v-if="scope.row.userAfter.endDate != null">{{ getDateYMD(scope.row.userAfter.endDate, '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原有身份等级" align="center" prop="userBefore.levelId" width="100px" />
      <el-table-column label="当前身份等级" align="center" prop="userAfter.levelId" width="100px" />
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
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
import { listRecord } from '@/api/invitation/consume'
import { listCoinMar } from '@/api/contract/margin'

export default {
  name: 'ConsumeRecord',
  data() {
    return {
      upgradeTypeOptions: [
        {
          upgradeType: 0,
          typeName: '赎回'
        },
        {
          upgradeType: 1,
          typeName: '消耗'
        },
        {
          upgradeType: 2,
          typeName: '抵押'
        }
      ],
      marList: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 购买/抵押/赎回操作记录表格数据
      recordList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        costCoin: undefined,
        upgradeType: undefined
      }
    }
  },
  created() {
    this.getMarList()
    this.getList()
  },
  methods: {
    // 保证金币种
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            this.marList = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 查询购买/抵押/赎回操作记录列表 */
    getList() {
      this.loading = true
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows
        this.total = response.total
        this.loading = false
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
