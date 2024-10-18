<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="渠道商" prop="channel">
        <el-select v-model="queryParams.channel" placeholder="请选择渠道商" clearable size="mini">
          <el-option
            v-for="item in channelOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计日期">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="smsEmailStatsList" border>
      <el-table-column label="渠道" align="center" prop="channel" />
      <el-table-column label="接收请求数量" align="center" prop="numberOfReceived" />
      <el-table-column label="请求网关成功数量" align="center" prop="numberOfSuccessful" />
      <el-table-column label="请求网关失败数量" align="center" prop="numberOfFailed" />
      <el-table-column label="网关回执成功数量" align="center" prop="successfulReceipts" />
      <el-table-column label="网关回执失败数量" align="center" prop="failedReceipts" />
      <el-table-column label="统计日期" align="center" prop="statisticalDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.statisticalDate) }}</span>
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
import { channelList, smsEmailStatsList } from '@/api/message/smsEmail'

export default {
  name: 'SmsEmailStats',
  data() {
    return {
      // 渠道商选项
      channelOptions: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 短信邮件统计表格数据
      smsEmailStatsList: [],
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        channel: undefined,
        statisticalDate: undefined
      }
    }
  },
  created() {
    this.getChannelselect()
    this.getList()
  },
  methods: {
    /** 渠道商下拉结构 */
    getChannelselect() {
      const params = {
        type: ''
      }
      channelList(params).then(response => {
        this.channelOptions = response.data
      })
    },
    /** 查询短信邮件统计列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      smsEmailStatsList(this.queryParams).then(response => {
        this.smsEmailStatsList = response.rows
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
      this.time = undefined
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        channel: undefined,
        statisticalDate: undefined
      }
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
