<template>
  <div style="padding-bottom: 20px">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
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
      <el-form-item label="成交单号">
        <el-input v-model="queryParams.matchId" size="mini" placeholder="请输入成交单号" clearable />
      </el-form-item>
      <el-form-item label="成交时间">
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
    </el-form>
    <!--table-->
    <el-table ref="table" v-loading="loading" border :data="cryptoList" @expand-change="handleExpand">
      <el-table-column label="成交单号" align="center" prop="matchId" />
      <el-table-column label="成交时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.tradeDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合约" align="center" prop="symbol" width="180" />
      <el-table-column :label="$t('dwmanager.userUID')" align="center" prop="uid" width="120" />
      <el-table-column label="所属订单委托单号" align="center" prop="orderId" />
      <el-table-column label="成交价" align="center" prop="dealPrice" />
      <el-table-column label="成交数量" align="center" prop="execSize" />
      <el-table-column label="买卖方向" align="center" prop="side">
        <template slot-scope="scope">
          <span v-if="scope.row.side == 1">买入</span>
          <span v-if="scope.row.side == -1">卖出</span>
        </template>
      </el-table-column>
      <el-table-column label="成交手续费" align="center" prop="fee" />
      <el-table-column label="已实现盈亏" align="center" prop="pnl" />

      <el-table-column label="查看对手方" align="center" class-name>
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleExpand(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table
            label-position="top"
            inline
            class="demo-table-expand"
            :data="popupList[scope.row.matchId] ? popupList[scope.row.matchId].rows : []"
          >
            <el-table-column :label="$t('dwmanager.userUID')" align="center" prop="uid" width="120" />
            <el-table-column label="所属订单委托单号" align="center" prop="orderId" />
            <el-table-column label="成交价" align="center" prop="dealPrice" />
            <el-table-column label="成交数量" align="center" prop="execSize" />
            <el-table-column label="买卖方向" align="center" prop="side">
              <template slot-scope="scope">
                <span v-if="scope.row.side == 1">买入</span>
                <span v-if="scope.row.side == -1">卖出</span>
              </template>
            </el-table-column>
            <el-table-column label="成交手续费" align="center" prop="fee" />
            <el-table-column label="已实现盈亏" align="center" prop="pnl" />
          </el-table>
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
import { contractList } from '@/api/userinfo/userInfo'
import { exportTransactionRecord } from '@/api/launchpad'
import { getInformation } from '@/api/finance/addr'
export default {
  name: 'ContractRecord',
  props: ['msg', 'contractOptions'],
  data() {
    return {
      time: undefined,
      loading: true,
      // 查询参数
      queryParams: {
        'pageNum': 1,
        'pageSize': 10,
        'userShortId': sessionStorage.getItem('userId'),
        'matchId': undefined,
        'contractId': undefined,
        'transStartTime': undefined,
        'transEndTime': undefined,
        'side': undefined
      },
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
      cryptoList: [],
      total: 0,
      popupList: {}
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      this.queryParams.transStartTime = (this.time && this.time[0]) || ''
      this.queryParams.transEndTime = (this.time && this.time[1]) || ''
      contractList(this.queryParams)
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
    handleExpand(row, expand) {
      if (!expand) {
        const $table = this.$refs.table
        $table.toggleRowExpansion(row)
      }
      if (this.popupList[row.matchId]) return
      this.loading = true
      this.$set(this.popupList, row.matchId, {})
      this.$set(this.popupList[row.matchId], 'rows', [])
      this.$set(this.popupList[row.matchId], 'total', 0)
      getInformation(row.matchId, row.contractId, row.side).then(response => {
        if (response.code === 200) {
          this.popupList[row.matchId].rows = response.rows
          this.popupList[row.matchId].total = response.total
        } else {
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
      this.queryParams.transStartTime = (this.time && this.time[0]) || ''
      this.queryParams.transEndTime = (this.time && this.time[1]) || ''
      const queryParams = this.queryParams
      this.$confirm('是否确认导出指定用户列表数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportTransactionRecord(queryParams)
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
