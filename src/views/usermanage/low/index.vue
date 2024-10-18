<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item :label="$t('user.userId')" prop="userId">
        <el-input
          v-model="queryParams.userId"
          :placeholder="$t('user.enter')"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item :label="$t('userManager.certificateNumner')" prop="certificateNumber">
        <el-input
          v-model="queryParams.certificateNumber"
          :placeholder="$t('userManager.enterCertificateNumner')"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item :label="$t('userManager.auditState')" prop="authStatus">
        <el-select v-model="queryParams.authStatus" size="mini" clearable :placeholder="$t('userManager.selectAuditState')">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.submitTime')">
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('common.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="lowList" border>
      <el-table-column :label="$t('dwmanager.userUID')" width="170">
        <template slot-scope="scope">
          <span v-if="scope.row.userId">
            <el-link type="primary" :underline="false" @click="toUserInfo(scope.row)">{{ scope.row.userId }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.phoneNumber')" align="center" prop="phone" />
      <el-table-column :label="$t('userManager.email')" width="180" align="center" prop="email" />

      <el-table-column :label="$t('userManager.certificateNumner')" width="180" align="center" prop="certificateNumber" />

      <el-table-column :label="$t('userManager.submitAuditTime')" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.firstAuditTime')" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.lastAuditTime')" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.realName')" align="center" prop="userName" />
      <el-table-column :label="$t('common.status')" align="center" prop="authStatus">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in statusOptions" :key="key">
            <span v-if="scope.row.authStatus == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name>
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.authLevel == '1' && scope.row.authStatus != '3'"
            size="mini"
            type="warning"
            @click="handleEdit(scope.$index, scope.row)"
          >
            <span v-if="scope.row.authStatus == '0' || scope.row.authStatus == '2'">{{ $t('userManager.audit') }}</span>
            <span v-else>{{ $t('userManager.repulse') }}</span>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="$t('userManager.identityVerification')" :visible.sync="dialogFormVisible">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item :label="$t('userManager.audit')" :label-width="formLabelWidth">
          <el-radio v-model="radio" label="1">{{ $t('userManager.resolve') }}</el-radio>
          <el-radio v-model="radio" label="2">{{ $t('userManager.reject') }}</el-radio>
        </el-form-item>
        <el-form-item v-if="radio == 2" :label="$t('userManager.reason')" :label-width="formLabelWidth">

          <el-input v-model="form.failReason" />

          <el-select v-model="rejectReasonTemplate" style="margin-top: 20px;" :placeholder="$t('common.pleaseChoose')" @change="failReason => (form.failReason = failReason)">
            <el-option v-for="item in rejectReasonTemplateList" :key="item.id" :label="item.template" :value="item.template" />
          </el-select>

        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTure">{{ $t('common.sure') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as auditTemplateApi from '@/api/auditTemplate/auditTemplate.js'
import { listLow, accept, reject } from '@/api/low/auth'
import dayjs from 'dayjs'

export default {
  name: 'LowAuth',
  data() {
    const time = [dayjs().startOf('date').format('YYYY-MM-DD HH:mm:ss'), dayjs().endOf('date').format('YYYY-MM-DD HH:mm:ss')]
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 初级实名认证表格数据
      lowList: [],
      time,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: (time && time[0]) || '',
        endTime: (time && time[1]) || '',
        userId: undefined,
        certificateNumber: undefined,
        authStatus: undefined
      },
      statusOptions: [
        {
          value: '0',
          label: this.$t('userManager.notAudit')
        },
        {
          value: '1',
          label: this.$t('userManager.auditSuccess')
        },
        {
          value: '2',
          label: this.$t('userManager.auditFail')
        },
        {
          value: '3',
          label: this.$t('userManager.authFail')
        }
      ],
      dialogFormVisible: false,
      formLabelWidth: '140px',
      radio: '1',
      rejectReasonTemplate: null,
      rejectReasonTemplateList: [],
      form: {
        failReason: '',
        id: ''
      }
    }
  },
  created() {
    this.getList()
    this.setRejectReasonTemplate()
  },
  methods: {
    async setRejectReasonTemplate() {
      const { rows } = await auditTemplateApi.getVerifyDataList()
      this.rejectReasonTemplateList = rows
    },
    /** 查询初级实名认证列表 */
    getList() {
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''

      if (Object.keys(this.queryParams).every(key => ['pageNum', 'pageSize'].includes(key) || !this.queryParams[key])) {
        this.$message.error(this.$t('userManager.errorTip1'))
        return
      }

      this.loading = true
      listLow(this.queryParams).then(response => {
        this.lowList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
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
        uid: undefined,
        authStatus: undefined
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleEdit(row, index) {
      this.form.id = index.uid
      this.dialogFormVisible = true
      this.rejectReasonTemplate = this.rejectReasonTemplateList[0].template
    },
    handleEditTure() {
      if (this.radio == 1) {
        const data = {
          userId: this.form.id
        }
        accept(data)
          .then(response => {
            this.$message({
              showClose: true,
              message: this.$t('userManager.authSuccess'),
              type: 'success'
            })
            this.dialogFormVisible = false
            this.getList()
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        if (this.form.failReason.length === 0 && this.rejectReasonTemplate.length === 0) {
          this.$message({
            showClose: true,
            message: this.$t('userManager.errorTip2'),
            type: 'error'
          })
          return
        }
        const reason = this.form.failReason ? this.form.failReason : this.rejectReasonTemplate
        const data = { userId: this.form.id, reason }
        reject(data)
          .then(response => {
            this.$message({
              showClose: true,
              message: this.$t('userManager.rejectSuccess'),
              type: 'success'
            })
            this.dialogFormVisible = false
            this.getList()
          })
          .catch(error => {
            console.log(error)
          })
      }
    }
  }
}
</script>
