<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams">
      <el-form-item :label="$t('giftLaxin.activityId')" prop="activityId">
        <el-input v-model="queryParams.activityId" size="mini" clearable />
      </el-form-item>
      <el-form-item :label="$t('giftLaxin.userUid')" prop="userUid">
        <el-input v-model="queryParams.userUid" size="mini" clearable />
      </el-form-item>
      <el-form-item :label="$t('giftLaxin.receiveTime')">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('giftLaxin.startTime')"
          :range-separator="$t('giftLaxin.to')"
          :end-placeholder="$t('giftLaxin.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item :label="$t('giftLaxin.arrivalStatus')" prop="state">
        <el-select v-model="queryParams.state" filterable clearable size="small" placeholder="请选择">
          <el-option
            v-for="item in receiveStateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">{{ $t('giftLaxin.search') }}</el-button>
        <el-button type="warning" @click="exportExcel">{{ $t('giftLaxin.export') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border>
      <el-table-column :label="$t('giftLaxin.activityId')" prop="activityId" align="center" min-width="200" />
      <el-table-column :label="$t('giftLaxin.activityName')" prop="activityName" align="center" min-width="200" />
      <el-table-column :label="$t('giftLaxin.receiveUserUid')" prop="userUidStr" align="center" min-width="300" />
      <el-table-column :label="$t('giftLaxin.registerTime')" prop="registerTime" align="center" min-width="300">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.registerTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.registeredIPNationality')" prop="registerNationality" align="center" min-width="200" />
      <el-table-column :label="$t('giftLaxin.receiveTime')" prop="receiveTime" align="center" min-width="300">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.receiveTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.giftCurrency')" prop="currencyName" align="center" min-width="200" />
      <el-table-column :label="$t('giftLaxin.receiveNum')" prop="receiveAmountStr" align="center" min-width="200" />
      <el-table-column :label="$t('giftLaxin.arrivalStatus')" prop="state" align="center" min-width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.state === -1">{{ $t('giftLaxin.nonExecution') }}</span>
          <span v-if="scope.row.state === 0">{{ $t('giftLaxin.executedSuccessfully') }}</span>
          <span v-if="scope.row.state === 1">{{ $t('giftLaxin.executedFail') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.ownedChannel')" prop="channelName" align="center" min-width="200" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>
<script>
import { getClaimRecord, exportRecord } from "../../../api/giftLaxin"
export default {
  data() {
    return {
      time: '',
      total: 0,
      tableData: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityId: undefined,
        userUid: undefined,
        receiveTimeStart: undefined,
        receiveTimeEnd: undefined,
        state: undefined
      },
      receiveStateOptions: [
        { value: undefined, label: this.$t('giftLaxin.all') },
        { value: -1, label: this.$t('giftLaxin.nonExecution') },
        { value: 0, label: this.$t('giftLaxin.executedSuccessfully') },
        { value: 1, label: this.$t('giftLaxin.executedFail') }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.queryParams.receiveTimeStart = (this.time && this.time[0]) || undefined
      this.queryParams.receiveTimeEnd = (this.time && this.time[1]) || undefined
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        activityId: this.queryParams.activityId ? this.queryParams.activityId : undefined,
        userUid: this.queryParams.userUid ? this.queryParams.userUid.toString() : undefined,
        receiveTimeStart: this.queryParams.receiveTimeStart ? this.queryParams.receiveTimeStart : undefined,
        receiveTimeEnd: this.queryParams.receiveTimeEnd ? this.queryParams.receiveTimeEnd : undefined,
        state: this.queryParams.state !== '' ? this.queryParams.state : undefined
      }
      const { rows, total } = await getClaimRecord(params)
      this.tableData = rows
      this.total = total
    },
    search() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 导出excel
    exportExcel() {
      const params = {
        activityId: this.queryParams.activityId ? this.queryParams.activityId : undefined,
        userUid: this.queryParams.userUid ? this.queryParams.userUid.toString() : undefined,
        receiveTimeStart: this.queryParams.receiveTimeStart ? this.queryParams.receiveTimeStart : undefined,
        receiveTimeEnd: this.queryParams.receiveTimeEnd ? this.queryParams.receiveTimeEnd : undefined,
        state: this.queryParams.state !== '' ? this.queryParams.state : undefined
      }
      exportRecord(params).then((res) => {
        if (res.code === 200) {
          this.download(res.data.fileName)
          this.msgSuccess(this.$t('giftLaxin.exportSuccess'))
        } else {
          this.msgError(this.$t('giftLaxin.exportFail'))
        }
      })
    }
  }
}
</script>
