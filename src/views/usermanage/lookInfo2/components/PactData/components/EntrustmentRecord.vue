<template>
  <div style="padding-bottom: 20px">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-row>
        <el-form-item label="合约" prop="symbol">
          <el-select
            v-model="queryParams.contractId"
            size="mini"
            filterable
            clearable
          >
            <el-option value="" :label="$t('common.all')" />
            <el-option
              v-for="(item,index) in contractOptions"
              :key="index"
              :label="item.displayName"
              :value="item.contractId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="委托单号">
          <el-input v-model="queryParams.orderId" size="mini" placeholder="请输入委托单号" clearable />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="queryParams.orderStatus" size="mini" clearable placeholder="请选择状态">
            <el-option
              v-for="item in statuses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="委托时间">
          <el-date-picker
            v-model="time"
            clearable
            size="mini"
            type="datetimerange"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startDate')"
            :end-placeholder="$t('common.endTime')"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="买卖方向" prop="typeStatus">
          <el-select
            v-model="queryParams.side"
            size="mini"
            clearable
            :placeholder="$t('common.all')"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label prop="symbol">
          <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
        </el-form-item>
        <el-form-item label prop="symbol">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
          >{{$t('common.derive')}}</el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <el-table v-loading="loading" border :data="cryptoList">
      <el-table-column label="委托单号" align="center" prop="orderId" />
      <el-table-column label="委托时间" align="center" prop="entrustTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.entrustTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合约ID" align="center" prop="contractId" width="180" />
      <el-table-column label="合约名称" align="center" prop="symbol" width="120" />
      <el-table-column label="开平标志" align="center" prop="positionEffect">
        <template slot-scope="scope">
          <span v-if="scope.row.positionEffect==1">开仓</span>
          <span v-if="scope.row.positionEffect==2">平仓</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金类型" align="center" prop="marginType">
        <template slot-scope="scope">
          <span v-if="scope.row.marginType==1">全仓</span>
          <span v-if="scope.row.marginType==2">逐仓</span>
        </template>
      </el-table-column>
      <el-table-column label="委托方向" align="center" prop="side">
        <template slot-scope="scope">
          <span v-if="scope.row.side==1">买入</span>
          <span v-if="scope.row.side==-1">卖出</span>
        </template>
      </el-table-column>
      <el-table-column label="条件委托" align="center" prop="conditionEntrust">
        <template slot-scope="scope">
          <span v-if="scope.row.conditionEntrust==0">--</span>
          <span v-if="scope.row.conditionEntrust==1">标记价</span>
          <span v-if="scope.row.conditionEntrust==2">最新价</span>
        </template>
      </el-table-column>
      <el-table-column label="条件触发价格" align="center" prop="conditionTriggerPrice" />
      <el-table-column label="委托类型" align="center" prop="entrustType">
        <template slot-scope="scope">
          <span v-if="scope.row.entrustType==1">市价</span>
          <span v-if="scope.row.entrustType==2">限价</span>
        </template>
      </el-table-column>
      <el-table-column label="委托价格" align="center" prop="entrustPrice" />
      <el-table-column label="委托数量" align="center" prop="entrustQuantity" />
      <el-table-column label="成交数量" align="center" prop="entrustNum" />
      <el-table-column label="成交均价" align="center" prop="avgPrice" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template slot-scope="scope">
          <span v-for="(item, index) in statuses" :key="index">
            <span v-if="scope.row.orderStatus == item.value">{{ item.label }}</span>
          </span>
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
        @pagination="load"
      />
    </div>
  </div>
</template>
<script>
import { entrustList } from '@/api/userinfo/userInfo'
import { exportEntrustRecord } from '@/api/launchpad'
export default {
  name: 'EntrustmentRecord',
  props: ['msg', 'contractOptions'],
  data() {
    return {
      time: undefined,
      loading: true,
      // 状态
      statuses: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '4',
          label: '已完成'
        },
        {
          value: '3',
          label: '部分成交'
        },
        {
          value: '5',
          label: '已撤单'
        },
        {
          value: '6',
          label: '未成交'
        }
      ],
      // 买入卖出状态
      typeOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '买入'
        },
        {
          value: '-1',
          label: '卖出'
        }
      ],
      // 查询参数
      queryParams: {
        'pageNum': 1,
        'pageSize': 10,
        'userShortId': sessionStorage.getItem('userId'),
        'contractId': undefined,
        'orderId': undefined,
        'orderStatus': undefined,
        'entrustStartTime': undefined,
        'entrustEndTime': undefined,
        'side': undefined
      },
      cryptoList: [],
      total: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      this.queryParams.entrustStartTime = (this.time && this.time[0]) || ''
      this.queryParams.entrustEndTime = (this.time && this.time[1]) || ''
      entrustList(this.queryParams)
        .then(response => {
          if (response.code === 200) {
            this.cryptoList = response.rows
            this.total = response.total
          } else {
            this.cryptoList = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.queryParams.entrustStartTime = (this.time && this.time[0]) || ''
      this.queryParams.entrustEndTime = (this.time && this.time[1]) || ''
      const queryParams = this.queryParams
      this.$confirm('是否确认导出指定用户列表数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportEntrustRecord(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped>
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100%;
  }

  .top {
    margin-top: 20px;
  }
</style>
