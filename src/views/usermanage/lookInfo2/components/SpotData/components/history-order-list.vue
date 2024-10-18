<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="币对" prop="instrumentId" label-width="40px">
        <el-select
          v-model="queryParams.instrumentId"
          size="mini"
          filterable
          clearable
          placeholder="请选择币对"
        >
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="(item,index) in pairList"
            :key="index"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成交状态" prop="state">
        <el-select v-model="queryParams.state" size="mini" clearable placeholder="请选择状态">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in statuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单号">
        <el-input v-model="queryParams.orderId" size="mini" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="委托方向" prop="side">
        <el-select v-model="queryParams.side" placeholder="请选择委托方向" size="mini" clearable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in sides"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="撤单原因" prop="cancelType">
        <el-select v-model="queryParams.cancelType" placeholder="请选择撤单原因" size="mini" clearable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in cancelTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下单来源" prop="orderSource">
        <el-select v-model="queryParams.orderSource" placeholder="请选择下单来源" size="mini" clearable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in orderSourceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button type="warning" size="mini" @click="exportExcel">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <!-- table -->
    <el-table v-loading="loading" border :data="historyCommissionList">
      <el-table-column label="委托订单号" align="center" prop="orderId" width="180" />
      <el-table-column label="委托方向" align="center" prop="side" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.side === -1">卖出</span>
          <span v-if="scope.row.side === 1">买入</span>
        </template>
      </el-table-column>
      <el-table-column label="委托时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.timestamp) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="委托数量" align="center" prop="orderQtyMsg" width="180" />
      <el-table-column label="委托类型" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 0">市价</span>
          <span v-if="scope.row.type === 1">限价</span>
          <span v-if="scope.row.type === 2">POST_ONLY</span>
          <span v-if="scope.row.type === 3">SELF</span>
        </template>
      </el-table-column>
      <el-table-column label="委托价格($)" align="center" prop="orderPriceMsg" width="180" />
      <el-table-column label="委托金额($)" align="center" prop="orderAmtMsg" width="180" />
      <el-table-column label="成交数量" align="center" prop="execQtyMsg" width="180" />
      <el-table-column label="成交金额($)" align="center" prop="execAmtMsg" width="180" />
      <el-table-column label="交易对" align="center" prop="instrumentName" width="180" />
      <el-table-column :label="$t('common.status')" align="center" prop="state" width="180">
        <template slot-scope="scope">
          <span v-for="(item, index) in statuses" :key="index">
            <span v-if="scope.row.state == item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="下单来源" align="center" prop="orderSource" width="180">
        <template slot-scope="scope">
          <span v-for="(item, index) in orderSourceOptions" :key="index">
            <span v-if="scope.row.orderSource == item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="API Key" align="center" prop="apiKey" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.apiKey !== null">{{ scope.row.apiKey }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="撤单原因" align="center" prop="cancelType" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.cancelType !== null">
            <span v-for="(item, index) in cancelTypeOptions" :key="index">
              <span v-if="scope.row.cancelType == item.value">{{ item.label }}</span>
            </span>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="200" prop="cancelReason">
        <template slot="header">
          {{$t('frozen.withdrawalInstruction')}}
          <el-tooltip class="item" effect="dark" content="展示撤单说明模版——模版触发名称" placement="top-start">
            <i class="el-icon-question" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span v-if="scope.row.cancelReason !== null">{{ scope.row.cancelReason }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { userOrderList, exportList } from '@/api/userinfo/userInfo'
export default {
  name: 'HistoryOrderList',
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      total: 0,
      loading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        state: '',
        orderId: '',
        instrumentId: '',
        userId: this.userId,
        side: '',
        cancelType: '',
        orderSource: ''
      },
      statuses: [
        { value: '1', label: '完全成交' },
        { value: '3', label: '已撤销' }
      ],
      sides: [
        { value: '1', label: '买入' },
        { value: '-1', label: '卖出' }
      ],
      cancelTypeOptions: [
        { value: 1, label: '用户撤单' },
        { value: 2, label: '人工撤单' },
        { value: 3, label: '系统撤单' }
      ],
      orderSourceOptions: [
        { value: 1, label: '客户端' },
        { value: 2, label: '普通API' },
        { value: 3, label: '官方API' }
      ],
      historyCommissionList: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList'])
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      userOrderList(this.queryParams).then(res => {
        this.historyCommissionList = res.rows
        this.total = res.total
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    exportExcel() {
      exportList(this.queryParams).then(res => {
        this.download(res.msg)
      })
    }
  }
}
</script>
