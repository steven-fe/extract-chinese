<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="150px">
      <el-form-item :label="$t('financemanager.businessScenario')" prop="bizType">
        <el-select v-model="form.bizType" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currencyCode">
        <el-select v-model="form.currencyCode" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')" filterable>
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.complimentaryLot')">
        <el-input v-model="form.batchNo" :placeholder="$t('financemanager.complimentaryLot1')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.useruid')">
        <el-input v-model="form.userId" :placeholder="$t('financemanager.pleaseEnterUserUID')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.startingTime')">
        <el-date-picker
          v-model="date"
          type="datetime"
          :start-placeholder="$t('common.startTime')"
          align="right"
          value-format="timestamp"
          @change="timeChange1"
        />
      </el-form-item>
      <el-form-item :label="$t('financemanager.endTime')">
        <el-date-picker
          v-model="date1"
          type="datetime"
          :start-placeholder="$t('common.endTime')"
          align="right"
          value-format="timestamp"
          @change="timeChange2"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="form.status" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.complimentaryCouponNote')" label-width="205px">
        <el-input v-model="form.remarks" :placeholder="$t('financemanager.pleaseEnterRemarks')" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportData">{{ $t('common.derive') }}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="audit(true, 2)">{{ $t('financemanager.batchPass') }}</el-button>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="audit(true, 3)">{{ $t('financemanager.batchRejection') }}</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table" @selection-change="handleSelectionChange">
      <el-table-column :label="$t('common.operation')" width="200px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.status === 1">
            <el-button type="primary" size="mini" @click="updateStatus(2, scope.row)">{{ $t('contractmanager.pass') }}</el-button>
            <el-button type="danger" size="mini" @click="updateStatus(3, scope.row)">{{ $t('usermanage.turnDown') }}</el-button>
          </div>
          <div v-else>
            --
          </div>
        </template>
      </el-table-column>
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">{{ typeLabel(statusOptions, scope.row.status) }}</template>
      </el-table-column>
      <el-table-column prop="batchNo" :label="$t('financemanager.couponLot')" align="center" width="180" />
      <el-table-column :label="$t('financemanager.applicationDate')" align="center" width="180">
        <template slot-scope="scope" type="form">{{ scope.row.atime }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.actualCouponDate')" align="center" width="180">
        <template slot-scope="scope" type="form">{{ scope.row.gtime }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.businessScenario')" align="center">
        <template slot-scope="scope">{{ typeLabel(typeOptions, scope.row.bizType) }}</template>
      </el-table-column>
      <!--      <el-table-column prop="userId" :label="$t('dwmanager.userUID')" align="center" width="180"></el-table-column>-->
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
      <el-table-column prop="userName" :label="$t('financemanager.userName')" align="center" />
      <el-table-column prop="currencyCode" :label="$t('common.coin')" align="center" />
      <el-table-column prop="giveNumber" :label="$t('financemanager.couponQuantity')" align="center" />
      <el-table-column :label="$t('financemanager.validUntil')" align="center" width="180">
        <template slot-scope="scope" type="form">{{ scope.row.vtime }}</template>
      </el-table-column>
      <el-table-column prop="remarks" :label="$t('common.remarks')" align="center" />
      <el-table-column prop="operate" :label="$t('financemanager.operatorName')" align="center" />

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
import { pageList, audit } from '@/api/finance/coupon'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import * as API from '@/api/finance/coupon'
import { mapState } from 'vuex'
import { exportData } from '@/api/finance/coupon'

export default {
  name: 'CouponPageList',
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
      typeOptions: [
        { label: this.$t('common.signUp'), value: 1 },
        { label: this.$t('dwmanager.realNameAuthentication'), value: 2 },
        { label: this.$t('financemanager.invite'), value: 3 },
        { label: this.$t('financemanager.other'), value: 4 }
      ],
      statusOptions: [
        { label: this.$t('dbmanager.unreviewed'), value: 1 },
        { label: this.$t('contractmanager.pass'), value: 2 },
        { label: this.$t('usermanage.turnDown'), value: 3 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        bizType: '',
        pageNum: 1,
        pageSize: 10,
        currencyCode: '',
        batchNo: '',
        userId: '',
        status: '',
        remarks: ''
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
      pageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updateStatus(state, row) {
      const params = {
        id: row.id,
        state: state
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
