<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="用户id" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户id"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单id" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单id"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结算时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="feeList" border>
      <el-table-column label="订单ID" align="center" prop="orderId" />
      <el-table-column label="用户ID" align="center" prop="uid" />
      <el-table-column label="虚拟货币" align="center" prop="goodsId" />
      <el-table-column label="订单状态" align="center" prop="orderType">
        <template slot-scope="scope">
          <span v-if="scope.row.status==1">买涨</span>
          <span v-else>买跌</span>
        </template>
      </el-table-column>
      <el-table-column label="倍数" align="center" prop="multiple" />
      <el-table-column label="本金" align="center" prop="recognizance" />
      <el-table-column label="资金费率" align="center" prop="feeRate" />
      <el-table-column label="资金费用" align="center" prop="feeAmount" />
      <el-table-column :label="$t('common.status')" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status==1">待划转</span>
          <span v-else>已入账</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
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
import { listFee } from '@/api/contract/fee'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 资金费用表格数据
      feeList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        orderId: undefined,
        beginTime: undefined,
        endTime: undefined
      },
      // 表单参数
      form: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询资金费用列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listFee(this.queryParams).then(response => {
        this.feeList = response.rows
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
