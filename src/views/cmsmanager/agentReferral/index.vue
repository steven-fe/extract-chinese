<template>
  <div class="app-container">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">

      <el-form-item label="申请时间">
        <el-date-picker
          v-model="queryParams.time"
          clearable
          size="mini"
          type="datetimerange"
          start-placeholder="开始时间"
          range-separator="至"
          end-placeholder="结束时间"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item label="审核状态">
        <el-select v-model="queryParams.auditState" size="small" placeholder="请选择状态">
          <el-option :key="''" label="全部" value="" />
          <el-option v-for="(item, index) in stateOptions" :key="index" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="load">查询</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="resetLoad">重置</el-button>
        <el-button type="warning" size="mini" icon="el-icon-download" @click="exportList">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="50px" />
      <el-table-column prop="ctime" label="申请时间">
        <template slot-scope="scope">
          {{ formatTime(scope.row.ctime) }}
        </template>
      </el-table-column>
      <el-table-column prop="uidStr" label="申请人UID" />
      <el-table-column prop="name" label="申请人姓名" />
      <el-table-column prop="email" label="申请人邮件地址" />
      <el-table-column prop="bdName" label="对接商务姓名">
        <template slot-scope="scope">
          {{ scope.row.bdName ? scope.row.bdName : '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="auditState" label="审核状态">
        <template slot-scope="scope">
          {{ getStateLabel(scope.row.auditState) }}
        </template>
      </el-table-column>
      <el-table-column prop="rejectReason" label="拒绝原因">
        <template slot-scope="scope">
          {{ scope.row.rejectReason ? scope.row.rejectReason : '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="auditTime" label="审核时间">
        <template slot-scope="scope">
          {{ formatTime(scope.row.auditTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" :disabled="+scope.row.auditState !== 0" @click="handleAudit(scope.row)">通过</el-button>
          <el-button size="mini" type="danger" :disabled="+scope.row.auditState !== 0" @click="handleRejected(scope.row)">拒绝</el-button>
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
        @pagination="load()"
      />
    </div>
  </div>
</template>

<script>
import { list, audit, exportList } from '@/api/agentReferral.js'
import dayjs from 'dayjs'

export default {
  data() {
    return {
      loading: true,
      tableData: [],
      total: 0,
      stateOptions: [
        { value: 0, label: '待审核' },
        { value: 1, label: '审核通过' },
        { value: 2, label: '拒绝' }
      ],
      queryParams: {
        time: '',
        sTime: null,
        eTime: null,
        auditState: null,
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  watch: {},
  async created() {
    await this.load()
  },
  methods: {
    handleAudit(row) {
      this.$confirm('确认审核通过，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(async() => {
        const { code } = await audit({ id: row.id, auditState: 1 })
        if (+code === 200) {
          this.$message({
            message: '审核成功',
            type: 'success'
          })
        }
        this.load()
      })
    },
    handleRejected(row) {
      this.$prompt('拒绝原因', '拒绝', {
        confirmButtonText: '确定',
        cancelButtonText: this.$t('common.cancel'),
        inputPlaceholder: '请输入拒绝原因',
        inputValidator: (value) => {
          if (!value) {
            return '请输入拒绝原因'
          } else if (value.length > 100) {
            return '拒绝原因不能超过100个字符'
          }
        }
      }).then(async({ value }) => {
        const { code } = await audit({ id: row.id, auditState: 2, rejectReason: value })
        if (+code === 200) {
          this.$message.success(this.$t('common.operationSucceed'))
          this.load()
        }
      }).catch(() => {})
    },
    // 加载
    async load() {
      this.loading = true

      const { time } = this.queryParams
      const formData = { ...this.queryParams, time: undefined, sTime: time ? time[0] : '', eTime: time ? time[1] : '' }

      try {
        const { code, total, rows, msg } = await list(formData)
        if (+code === 200) {
          this.tableData = rows.sort((a, b) => b.id - a.id)
          this.total = total
        } else {
          this.tableData = []
          this.total = 0
          this.msgError(msg)
        }
      } catch (error) {
        console.log(error)
        this.tableData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    resetLoad() {
      this.queryParams = {
        time: '',
        sTime: null,
        eTime: null,
        auditState: null,
        pageNum: 1,
        pageSize: 10
      }
      this.load()
    },
    formatTime(time) {
      if (!time) return '--'
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    getStateLabel(state) {
      return this.stateOptions.find(item => item.value === state).label
    },
    async exportList() {
      const { data } = await exportList()
      this.download(data.fileName)
    }
  }
}
</script>
