<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="120px">
      <el-form-item label="UID:">
        <el-input v-model="form.uid" :placeholder="$t('financemanager.pleaseEnterUid')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.batchNo')">
        <el-input v-model="form.batchNo" :placeholder="$t('financemanager.pleaseEnterTheBatchNumber')" clearable />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table" @selection-change="handleSelectionChange">
      <el-table-column :label="$t('common.operation')" width="200px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.state === 3 && scope.row.grantStatus === 1">
            <el-button type="danger" size="mini" @click="updateStatus(scope.row)">{{ $t('financemanager.takeBack') }}</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" :label="$t('common.orderNumber')" align="center" />
      <el-table-column prop="batchNo" :label="$t('financemanager.batchNo')" align="center" />
      <el-table-column :label="$t('dwmanager.userUID')" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.userId">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.userId }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="configKey" :label="$t('financemanager.experienceMoneyAllocation')" align="center" />
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">{{ typeLabel(statusOptions, scope.row.state) }}</template>
      </el-table-column>
      <el-table-column prop="grantErrorReason" :label="$t('financemanager.causeOfFailure')" align="center" />
      <el-table-column :label="$t('contractmanager.useOfState')" align="center">
        <template slot-scope="scope">{{ typeLabel(grantStatusOptions, scope.row.grantStatus) }}</template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import { batchUserPageList } from '@/api/operate/bonus'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapState } from 'vuex'
import * as API from '@/api/operate/bonus'

export default {
  name: 'BatchBonusUserPageList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      statusOptions: [
        { label: this.$t('financemanager.created'), value: 1 },
        { label: this.$t('financemanager.onTheWay'), value: 2 },
        { label: this.$t('common.successful'), value: 3 },
        { label: this.$t('financemanager.fail'), value: 4 },
        { label: this.$t('financemanager.repulse'), value: 5 }
      ],
      grantStatusOptions: [
        { label: this.$t('financemanager.creation'), value: 1 },
        { label: this.$t('financemanager.frozenUnused'), value: 2 },
        { label: this.$t('financemanager.frozenInUse'), value: 3 },
        { label: this.$t('financemanager.finish'), value: 4 },
        { label: this.$t('financemanager.pastDue'), value: 5 },
        { label: this.$t('financemanager.overdue'), value: 6 },
        { label: this.$t('financemanager.invalidDelete'), value: 7 },
        { label: this.$t('financemanager.locked'), value: 8 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        uid: '',
        pageNum: 1,
        pageSize: 10,
        batchNo: ''
      },
      date: '',
      date1: '',
      tableData: [{}],
      open: false,
      selectArr: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },

  mounted() {
    this.getConfigList()
  },
  methods: {
    // 导出
    exportData() {
      exportData(this.form).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: this.$t('financemanager.exportSuccessfully')
          })
        }
      })
    },
    // 表格复选框选中方法
    handleSelectionChange(val) {
      this.selectArr = []
      const arr = val.filter(el => {
        return el.status.toString() !== '1'
      })
      const arr1 = val.filter(el => {
        return el.status.toString() === '1'
      })
      if (arr && arr.length > 0) {
        this.$message({
          type: 'warning',
          message: this.$t('financemanager.ignoreAuditedItems'),
          duration: 3000
        })
      }
      arr1.forEach(el => {
        this.selectArr.push(el.id)
      })
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 开始日期改变事件
    timeChange1(val) {
      if (val) {
        this.form.startTime = val
        return
      }
      this.form.startTime = ''
    },
    // 结束日期改变事件
    timeChange2(val) {
      if (val) {
        this.form.endTime = val
        return
      }
      this.form.endTime = ''
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      batchUserPageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updateStatus(row) {
      const params = {
        id: row.id
      }
      API.updateStatus(params).then(res => {
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: this.$t('common.operationSucceed')
          })
          this.getConfigList()
        } else {
          this.$message({
            type: 'error',
            message: this.$t('financemanager.operationFailure')
          })
        }
      })
    },
    // 审核通过、驳回
    audit(flag, state, id) {
      const params = {
        ids: [id],
        status: state
      }
      if (flag && this.selectArr.length === 0) {
        this.$message({
          type: 'info',
          message: this.$t('financemanager.pleaseSelectBatchAuditItems')
        })
        return
      }
      if (flag) {
        params.ids = this.selectArr
      }
      this.$confirm(this.$t('financemanager.whetherToReviewTheItem'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        audit(params).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: this.$t('common.successfulAudit')
            })
            this.getConfigList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('financemanager.auditCancellation')
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
</style>
