<template>
  <el-dialog :title="$t('financemanager.unlockDetails')" :visible.sync="show" width="">
    <div class="taskDetail">
      <div class="cont">
        <div>{{ $t('common.taskName') }}：{{ jobFlowData.jobName }}</div>
        <div>{{ $t('financemanager.unlockCurrency') }}：{{ jobFlowData.currencyName }}</div>
        <div>{{ $t('common.unlockCycle1') }}：{{ jobFlowData.unlockCycle }}</div>
        <div>{{ $t('common.unlockType') }}：{{ jobFlowData.unlockType }}</div>
        <div>{{ $t('common.amountUnlockedEachTime') }}：{{ jobFlowData.unlockNum }}</div>
      </div>
      <div class="cont">
        <div>{{ $t('common.unlockingTimes') }}：{{ jobFlowData.unlockCount }}</div>
        <div>{{ $t('common.taskCreationTime') }}：{{ jobFlowData.createdAt }}</div>
        <div>{{ $t('common.firstUnlockTime') }}：{{ jobFlowData.unlockFirstTime }}</div>
        <div>{{ $t('common.lastUnlockTime') }}：{{ jobFlowData.unlockLastTime }}</div>
        <div>{{ $t('common.statusType') }}：{{ jobFlowData.state }}</div>
      </div>
    </div>

    <div class="search">
      <el-form ref="form" :inline="true" :model="form" label-width="110px">
        <el-form-item label="UID：" prop="uid">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item :label="$t('financemanager.lockupTime')" prop="time">
          <el-date-picker
            v-model="form.time"
            type="datetimerange"
            value-format="timestamp"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startTime')"
            :end-placeholder="$t('common.endTime')"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="jobFlow">{{ $t('common.search') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="userId" label="UID" align="center" width="100" />
      <el-table-column prop="unlockAmount" :label="$t('common.numberOfLocksToUnlock')" align="center" />
      <el-table-column prop="actUnlockAmount" :label="$t('common.actualUnlockedQuantity')" align="center" />
      <el-table-column prop="depositAmount" :label="$t('common.totalRechargeQuantity')" align="center" />
      <el-table-column prop="tradeAmount" :label="$t('common.previousDayTradingVolume')" align="center" />
      <el-table-column prop="tradeBuyAmount" :label="$t('common.quantityPurchasedThePreviousDay')" align="center" />
      <el-table-column prop="createdAt" :label="$t('financemanager.releaseTime')" align="center" width="200" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pagination"
      />
    </div>
  </el-dialog>
</template>

<script>
import { jobFlow } from '@/api/operate/lock'

export default {
  name: 'Detail',
  data() {
    return {
      show: false,
      row: {},
      jobFlowData: {},
      form: {
        uid: '',
        sTime: '',
        eTime: '',
        time: [],
        jobId: '',
        pageNum: 0,
        pageSize: 10
      },
      total: 0,
      tableData: []
    }
  },
  methods: {
    init(row) {
      this.show = true
      // this.row = row
      this.form.jobId = row.id
      this.jobFlow()
    },
    jobFlow() {
      this.form.sTime = this.form.time && this.form.time.length > 0 ? this.form.time[0] : ''
      this.form.eTime = this.form.time && this.form.time.length > 0 ? this.form.time[1] : ''
      const param = JSON.parse(JSON.stringify(this.form))
      param.time = undefined
      jobFlow(param).then(res => {
        console.log('任务详情返回值', res)
        if (res.code === 200) {
          this.jobFlowData = res.data
          this.tableData = res.data.flowList.rows
          this.total = res.data.flowList.total
        }
      })
    },
    pagination(pageData) {
      this.form.pageNum = pageData.page
      this.jobFlow()
    }
  }
}
</script>

<style lang="scss" scoped>
.taskDetail {
  display: flex;
  padding-left: 30px;
  padding-bottom: 30px;
  border-bottom: 2px solid #dfe4ed;
  .cont {
    width: 50%;
    div {
      padding-top: 10px;
    }
  }
}
.search {
  padding: 20px 0;
}

</style>
