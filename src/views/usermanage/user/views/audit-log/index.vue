<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="UID">
        <el-input v-model="queryParams.uid" size="mini" :placeholder="$t('common.fillContent')" />
      </el-form-item>

      <el-form-item :label="$t('userManager.status')">
        <el-select v-model="queryParams.reviewStatus" size="mini" filterable clearable :placeholder="$t('userManager.all')">
          <el-option v-for="({ value, label }) in reviewStatusList" :key="value" :label="label" :value="value" />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('userManager.auditID')">
        <el-input v-model="queryParams.applyId" size="mini" clearable :placeholder="$t('common.fillContent')" />
      </el-form-item>

      <el-form-item :label="$t('userManager.submitTime')">
        <el-date-picker
          :value="queryParams.applyBeginTime ? [queryParams.applyBeginTime, queryParams.applyEndTime] : null"
          clearable
          size="mini"
          type="datetimerange"
          start-placeholder="开始时间"
          range-separator="至"
          end-placeholder="结束时间"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
          @input="(nullOrTimeList) => {
            queryParams.applyBeginTime = nullOrTimeList ? nullOrTimeList[0] : undefined
            queryParams.applyEndTime = nullOrTimeList ? nullOrTimeList[1] : undefined
          }"
        />
      </el-form-item>

      <el-form-item :label="$t('userManager.auditTime')">
        <el-date-picker
          :value="queryParams.reviewBeginTime ? [queryParams.reviewBeginTime, queryParams.reviewEndTime] : null"
          clearable
          size="mini"
          type="datetimerange"
          start-placeholder="开始时间"
          range-separator="至"
          end-placeholder="结束时间"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
          @input="(nullOrTimeList) => {
            queryParams.reviewBeginTime = nullOrTimeList ? nullOrTimeList[0] : undefined
            queryParams.reviewEndTime = nullOrTimeList ? nullOrTimeList[1] : undefined
          }"
        />
      </el-form-item>

      <el-form-item :label="$t('userManager.auditName')">
        <el-input v-model="queryParams.reviewerName" size="mini" clearable :placeholder="$t('common.fillContent')" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('common.search') }}</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleExport">{{ $t('common.derive') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border>
      <el-table-column :label="$t('userManager.no')" align="center" prop="id" />

      <el-table-column :label="$t('userManager.auditID')" align="center" prop="applyId" />

      <el-table-column :label="$t('userManager.userUID')" align="center" prop="uid">
        <el-link slot-scope="scope" type="primary" @click="toUserInfo(scope.row)">{{ scope.row.uid }}</el-link>
      </el-table-column>

      <el-table-column :label="$t('userManager.userName')" align="center" prop="idName" />

      <el-table-column :label="$t('userManager.country')" align="center" prop="country" />

      <el-table-column :label="$t('userManager.idCardNumber')" align="center" prop="idNumber" />

      <el-table-column :label="$t('userManager.submitTime')" align="center" prop="applyTtime" :formatter="({ applyTtime }) => parseTime(applyTtime)" />

      <el-table-column :label="$t('userManager.status')" align="center" prop="reviewStatus" :formatter="({ reviewStatus }) => reviewStatusList.find(({ value }) => value === reviewStatus).label" />

      <el-table-column :label="$t('userManager.auditName')" align="center" prop="reviewerName" />

      <el-table-column :label="$t('userManager.auditTime')" align="center" prop="reviewerTime" :formatter="({ reviewerTime }) => parseTime(reviewerTime)" />

    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import * as api from './api'
import dayjs from 'dayjs'

export default {
  name: 'KycAuditLog',
  data() {
    return {
      reviewStatusList: Object.freeze([
        { label: this.$t('userManager.all'), value: undefined },
        { label: this.$t('userManager.auditSuccess'), value: 1 },
        { label: this.$t('userManager.auditFail'), value: 2 },
        { label: this.$t('userManager.KYC1AndKYC2NotSuccess'), value: 3 }
      ]),

      queryParams: {
        uid: undefined,
        reviewStatus: undefined,
        applyId: undefined,
        applyBeginTime: undefined,
        applyEndTime: undefined,
        reviewBeginTime: +dayjs().startOf('date'),
        reviewEndTime: +dayjs().endOf('date'),
        reviewerName: undefined,
        pageNum: 1,
        pageSize: 50
      },

      loading: true,

      total: 0,

      dataList: []
    }
  },
  async created() {
    await Promise.allSettled([this.getList()])
  },
  methods: {
    async getList() {
      try {
        this.loading = true
        const res = await api.getLogList(this.queryParams)
        this.dataList = res.rows
        this.total = res.total || 0
      } catch (e) {
        console.error(e)
        this.dataList = []
      } finally {
        this.loading = false
      }
    },
    async handleQuery() {
      await this.getList()
    },
    toUserInfo(row) {
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    async handleExport() {
      const queryParams = { ...this.queryParams }
      delete queryParams.pageNum
      delete queryParams.pageSize

      const { msg } = await api.exportList(this.queryParams)
      this.download(msg)
      this.msgSuccess(this.$t('userManager.exportSuccess'))
    },
    parseTime(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style lang="scss" module></style>
