<template>
  <div class="lock">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form" label-width="130px">
        <el-form-item :label="$t('financemanager.unlockCurrency')" prop="currencyId">
          <el-select v-model="form.currencyId" filterable clearable :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in codeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('financemanager.taskName')" prop="jobName">
          <el-input v-model="form.jobName" />
        </el-form-item>
        <el-form-item :label="$t('financemanager.unlockType')" prop="unlockType">
          <el-select v-model="form.unlockType" filterable clearable :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in unlockType"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('financemanager.taskStatus')" prop="state">
          <el-select v-model="form.state" filterable clearable :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in taskStatus"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="initTableData">{{ $t('common.search') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="exportData(1)">{{ $t('common.derive') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="exportData(2)">{{ $t('financemanager.exportAll') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="create">
      <el-button type="success" size="mini" icon="el-icon-plus" @click="showDialog">{{ $t('financemanager.taskUnlocking') }}</el-button>
    </div>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table" @selection-change="selectionChange">
      <el-table-column type="selection" :label="$t('usermanage.checkAll')" label-class-name="mySelection" width="100" align="center" />
      <el-table-column prop="id" :label="$t('financemanager.taskID')" align="center" />
      <el-table-column prop="currencyName" :label="$t('financemanager.unlockCurrency')" align="center" />
      <el-table-column prop="userNum" :label="$t('financemanager.unlockUserNumbers')" align="center" />
      <el-table-column prop="unlockType" :label="$t('financemanager.unlockType')" align="center" />
      <el-table-column prop="createdAt" :label="$t('common.createTime')" align="center" />
      <el-table-column prop="unlockFirstTime" :label="$t('financemanager.startTime')" align="center" />
      <el-table-column prop="unlockEndTime" :label="$t('financemanager.endTime')" align="center" />
      <el-table-column prop="sysUserId" :label="$t('financemanager.administratorNumber')" align="center" />
      <el-table-column prop="state" :label="$t('financemanager.taskStatus')" align="center" />
      <el-table-column prop="remark" :label="$t('common.operation')" align="center" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="closeTask(scope.row)">{{ $t('financemanager.closeTask') }}</el-button>
          <el-button type="primary" size="mini" @click="detail(scope.row)">{{ $t('financemanager.unlockDetails') }}</el-button>
        </template>
      </el-table-column>
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
    <create ref="create" @success="initTableData" />
    <detail ref="detail" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { jobList, closeJob, jobExport, jobExportAll } from '@/api/operate/lock'
import Create from './Create.vue'
import Detail from './Detail.vue'

export default {
  name: 'LockSymbol',
  components: {
    Create,
    Detail
  },
  data() {
    return {
      selectData: [], // 选择的数据
      taskStatus: [
        { id: '', name: this.$t('common.all') },
        { id: 1, name: this.$t('financemanager.inExecution') },
        { id: 2, name: this.$t('dwmanager.finished') },
        { id: 3, name: this.$t('usermanage.closed') }
      ],
      unlockType: [
        { id: '', name: this.$t('common.all') },
        { id: 1, name: this.$t('financemanager.fixedQuantity') },
        { id: 2, name: this.$t('financemanager.fixedPercentage') },
        { id: 3, name: this.$t('financemanager.percentageOfRechargeQuantity') },
        { id: 4, name: this.$t('financemanager.percentageOfPreviousDaySTransactions') },
        { id: 5, name: this.$t('financemanager.percentageOfPreviousDaySPurchases') }
      ],
      form: {
        currencyId: '', // 币种
        jobName: '',
        state: '',
        unlockType: '',
        pageNum: 0,
        pageSize: 10
      },
      total: 0,
      tableData: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    codeOptions() {
      return this.currencyList
    }
  },
  created() {
    this.getCurrency(1)
  },
  mounted() {
    this.initTableData()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    showDialog() {
      this.$refs.create.init()
    },
    selectionChange(arrRow) {
      this.selectData = arrRow.map(item => item.id)
      console.log('选择的数据', this.selectData)
    },
    initTableData() {
      jobList(this.form).then(res => {
        console.log('res', res)
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    // 翻页
    pagination(pageData) {
      this.form.pageNum = pageData.page
      this.initTableData()
    },
    exportData(flag) {
      // 1 导出，2，全部导出
      if (flag === 1) {
        if (this.selectData.length === 0) {
          this.$message.warning(this.$t('financemanager.pleaseSelectData'))
          return
        }
        const param = this.selectData.join(',')
        jobExport({ jobId: param }).then(res => {
          console.log('部分导出', res)
          if (res.code === 200) {
            this.download(res.msg)
          }
        })
      }
      if (flag === 2) {
        jobExportAll(this.form).then(res => {
          console.log('全部导出', res)
          if (res.code === 200) {
            this.download(res.msg)
          }
        })
      }
    },
    closeTask(row) {
      this.$confirm(this.$t('financemanager.areYouSureAboutShuttingDownTheMission'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('systemsetting.closed'),
        type: 'warning'
      }).then(() => {
        // 下载标记文档
        closeJob({ jobId: row.id }).then(res => {
          console.log('关闭任务', res)
          if (res.code === 200) {
            this.$message.success(this.$t('financemanager.closedTaskSuccessfully'))
            this.initTableData()
          }
        })
      }).catch(() => {
        // this.show = false
      })
    },
    detail(row) {
      this.$refs.detail.init(row)
    }
  }
}
</script>

<style lang="scss" scoped>
.lock {
  padding: 10px 20px;
}
.search {
  border-bottom: 2px solid #dfe4ed;
  padding: 20px 0;
}
.create {
  text-align: right;
  padding: 20px 0;
}
.table ::v-deep .mySelection .cell:after {
  content: "Check All";
  margin-left: 10px;
}
</style>
