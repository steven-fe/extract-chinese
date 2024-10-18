<template>
  <div class="app-container">
    <el-form
      ref="form"
      :inline="true"
      :model="form"
      label-width="140px"
    >
      <el-form-item :label="$t('financemanager.configurationKey')">
        <el-input
          v-model="form.configKey"
          :placeholder="$t('financemanager.configurationKey1')"
          clearable
        />
      </el-form-item>
      <el-form-item :label="$t('financemanager.describe')">
        <el-input
          v-model="form.desc"
          :placeholder="$t('financemanager.describe1')"
          clearable
        />
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
      <el-form-item
        :label="$t('common.status')"
        prop="status"
      >
        <el-select
          v-model="form.status"
          filterable
          clearable
          size="small"
          :placeholder="$t('common.pleaseChoose')"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="getConfigList(true)"
        >{{ $t('common.seek') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      class="table cabin-table"
    >
      <el-table-column
        :label="$t('common.operation')"
        width="200px"
        align="center"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.status === 2">
            <el-button
              type="danger"
              size="mini"
              @click="getErrorList(scope.row)"
            >{{ $t('financemanager.causeOfFailure') }}</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="id"
        :label="$t('common.orderNumber')"
        align="center"
      />
      <el-table-column
        prop="batchNo"
        :label="$t('financemanager.batchNo')"
        align="center"
      />
      <el-table-column
        prop="bonusKey"
        :label="$t('financemanager.experienceMoneyAllocation')"
        align="center"
      />
      <el-table-column
        prop="describe"
        :label="$t('financemanager.describe')"
        align="center"
      />
      <el-table-column prop="gtime" :label="$t('financemanager.timeOfRelease')" align="center" />
      <el-table-column
        :label="$t('common.status')"
        align="center"
      >
        <template slot-scope="scope">{{ typeLabel(statusOptions, scope.row.status) }}</template>
      </el-table-column>
      <el-table-column
        prop="grantNo"
        :label="$t('financemanager.numberIssued')"
        align="center"
      />
      <el-table-column
        prop="errorNo"
        :label="$t('financemanager.numberfailed')"
        align="center"
      />
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
    <errList :is-show="isShow" />
  </div>
</template>
<script>
import { batchPageList } from '@/api/operate/bonus'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapState } from 'vuex'
import errList from './errList/index.vue'
import * as API from '@/api/operate/bonus'
export default {
  name: 'BatchPageList',
  components: {
    errList
  },
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
      isShow: {
        dialogTableVisible: false,
        errDatas: []
      },

      pickerOptions: {
        disabledDate: time => {
          if (time) {
            return (
              time.getTime() <
              new Date(new Date().toLocaleDateString()).getTime()
            )
          }
          return true
        }
      },
      statusOptions: [
        { label: this.$t('common.all'), value: 0 },
        { label: this.$t('common.successful'), value: 1 },
        { label: this.$t('financemanager.fail'), value: 2 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        configKey: '',
        pageNum: 1,
        pageSize: 10,
        desc: '',
        batchNo: '',
        status: '',
        startTime: '',
        endTime: ''
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
      batchPageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getErrorList(row) {
      this.isShow.batchNo = row.batchNo
      const params = {
        batchNo: row.batchNo
      }
      API.errorList(params).then(res => {
        this.isShow.errDatas = []
        res.data.forEach(item => {
          const obj = {
            fId: item.fid,
            userId: item.userId,
            ffailMessage: item.ffailMessage
          }
          this.isShow.errDatas.push(obj)
        })
        this.isShow.dialogTableVisible = true
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
      })
        .then(() => {
          audit(params).then(res => {
            if (res.code === 200) {
              this.$message({
                type: 'success',
                message: this.$t('common.successfulAudit')
              })
              this.getConfigList()
            }
          })
        })
        .catch(() => {
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
