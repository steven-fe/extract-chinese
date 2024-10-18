<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="120px">
      <el-form-item label="UID" label-width="60px">
        <el-input v-model="form.userUid" size="mini" :placeholder="$t('financemanager.pleaseEnterUid')" clearable />
      </el-form-item>
      <el-form-item :label="$t('frozen.dateTheWithdrawalWasInitiated')" label-width="235px">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item :label="$t('frozen.withdrawalStatus')" label-width="137px">
        <el-select v-model="form.status" filterable clearable size="mini" :placeholder="$t('frozen.selectWithdrawalStatus')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in cancelOrderStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('frozen.transactionPair')" label-width="130px">
        <el-select v-model="form.symbolId" filterable clearable size="mini" :placeholder="$t('frozen.selectTransactionPair')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in accountTypeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('frozen.dateTheWithdrawalOperationWasCompleted')" label-width="320px">
        <el-date-picker
          v-model="finishTime"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button type="primary" size="mini" @click="exportExcel">
          {{$t('common.derive')}}
          <el-tooltip class="item" effect="dark" :content="$t('frozen.exportBasedOnTheFilteredContent')" placement="top">
            <i class="el-icon-question" />
          </el-tooltip>
        </el-button>
      </el-form-item>
    </el-form>
    <div class="tip">{{$t('frozen.withdrawalRecordsStoredHereInclude')}}<br>{{$t('frozen.recordOfTheOperationCancellationInTheUserDetails')}}<br>{{$t('frozen.recordsOfWithdrawalByTheBatchWithdrawalTool')}}</div>
    <el-table :data="tableData" border>
      <el-table-column :label="$t('frozen.dateTheWithdrawalWasInitiated')" align="center" min-width="200">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column :label="$t('frozen.withdrawalDateCompleted')" align="center" min-width="200">
        <template slot-scope="scope">{{ parseTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="UID" prop="userUidStr" align="center" min-width="200" />
      <el-table-column :label="$t('frozen.transactionPair')" prop="symbolDisplayName" align="center" min-width="200" />
      <el-table-column align="center" width="200" prop="templateName" min-width="200">
        <template slot="header">
          {{$t('frozen.withdrawalInstruction')}}
          <el-tooltip class="item" effect="dark" :content="$t('frozen.clientDisplaysTheTemplateName')" placement="top">
            <i class="el-icon-question" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" prop="status" align="center" min-width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in cancelOrderStatusOptions" :key="index">
            <span v-if="scope.row.status == item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.causeOfFailure')" align="center" min-width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.errorMsg !== null">{{ scope.row.errorMsg }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.remarks')" prop="remark" align="center" min-width="200" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>
<script>
import { getCancelOrderRecordList, exportCancelOrderRecord, getAllSymbols } from '@/api/finance/cancel-order-record'

export default {
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        userUid: '',
        status: '',
        symbolId: '',
        startCancelTime: '',
        endCancelTime: '',
        startCancelCompleteTime: '',
        endCancelCompleteTime: ''
      },
      time: '',
      finishTime: '',
      total: 0,
      tableData: [],
      cancelOrderStatusOptions: [
        { value: 0, label: this.$t('dwmanager.beingProcessed') },
        { value: 1, label: this.$t('frozen.successfulWithdrawal') },
        { value: 2, label: this.$t('frozen.withdrawalFailure') }
      ],
      accountTypeOptions: []
    }
  },
  created() {
    this.getList()
    this.getSymbols()
  },
  methods: {
    getList() {
      this.form.startCancelTime = (this.time && this.time[0]) || ''
      this.form.endCancelTime = (this.time && this.time[1]) || ''
      this.form.startCancelCompleteTime = (this.finishTime && this.finishTime[0]) || ''
      this.form.endCancelCompleteTime = (this.finishTime && this.finishTime[1]) || ''
      getCancelOrderRecordList(this.form).then(res => {
        this.tableData = res.rows
        this.total = res.total
      })
    },
    handleQuery() {
      this.form.pageNum = 1
      this.getList()
    },
    getSymbols() {
      getAllSymbols().then(res => {
        this.accountTypeOptions = res.data
      })
    },
    exportExcel() {
      exportCancelOrderRecord(this.form).then(res => {
        this.download(res.data.fileName)
      })
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.tip {
  width: 310px;
  margin-bottom: 20px;
  border: 1px solid rgb(228, 225, 225);
  padding: 10px;
  color: rgb(133, 129, 129);
}
</style>
