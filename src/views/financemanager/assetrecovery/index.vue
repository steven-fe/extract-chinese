<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="120px">
      <el-form-item :label="$t('financemanager.batchNo')" prop="code">
        {{ form.batchNumber ? form.batchNumber : '- -' }}
      </el-form-item>
      <el-form-item prop="type">
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :auto-upload="false"
          class="upload-demo"
          :disabled="errorExcelState !== 'over'"
        >
          <el-button type="primary" size="mini" :disabled="errorExcelState !== 'over'">{{ $t('financemanager.selectFile') }}</el-button>
          <span style="font-size: 14px; color: #999">{{ fileName }}</span>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="downLoad">{{ $t('financemanager.downloadTemplate') }}</el-button>
        <el-button type="primary" size="mini" :disabled="errorExcelState !== 'over'" @click="batchAdd">{{ $t('financemanager.confirmImport') }}</el-button>
      </el-form-item>
    </el-form>
    <p style="font-size: 14px; color: #666;">{{ $t('financemanager.importDataThisTime', {number: formData.length}) }}</p>

    <el-table v-if="excelSuccessTableData.length" :data="excelSuccessTableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="currencyCode" :label="$t('common.coin')" align="center" />
      <el-table-column prop="amount" :label="$t('financemanager.recyclingQuantity')" align="center" />
      <el-table-column prop="count" :label="$t('financemanager.numberOfBranches')" align="center" />
    </el-table>

    <br>
    <template v-for="item in errorExcelList">
      <el-button v-if="item.status === 1" :key="item.batchId" type="danger" @click="downErrorFile(item.batchId)">{{ $t('financemanager.downloadTheFileThatFailedToExecute') }}（{{ item.batchId }}）</el-button>
      <el-button v-else :key="item.batchId" type="danger" :loading="true">{{ $t('dwmanager.beingProcessed') }}（{{ item.batchId }}）</el-button>
    </template>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="batchNumber" :label="$t('financemanager.giftLot')" align="center" />
      <el-table-column :label="$t('financemanager.actualDateOfGift')" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.transferTime | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="chainProtocol" :label="$t('financemanager.businessScenario')" align="center">
        <template slot-scope="scope">{{ typeLabel(typeOptions, scope.row.sceneType) }}</template>
      </el-table-column>
      <el-table-column prop="uid" :label="$t('financemanager.userUID')" align="center" width="160" />
      <el-table-column prop="userName" :label="$t('financemanager.userName')" align="center" />
      <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
      <el-table-column prop="volume" :label="$t('financemanager.quantityOfGift')" align="center" />
      <el-table-column prop="remark" :label="$t('common.remarks')" align="center" />
      <el-table-column prop="operator" :label="$t('financemanager.operatorName')" align="center" />
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">{{ typeLabel(stateOptions, scope.row.state) }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.transferCondition')" align="center">
        <template slot-scope="scope">{{ typeLabel(transferOptions, scope.row.transferState) }}</template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        :page-sizes="[10, 20, 30, 50, 100, 500, 1000, 2000]"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import { recoveryBatchadd, getBatchRecordList, freeListadd, getExcelFileName } from '@/api/finance/freecurrency'
import { getNowFormatDate } from '@/utils'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'

export default {
  name: 'Assetrecovery',
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
      total: 0,
      configId: '',
      form: {
        batchNumber: '',
        file: null,
        pageNum: 1,
        pageSize: 10
      },
      fileName: this.$t('financemanager.unselectedFile'),
      formData: [],
      typeOptions: [
        { label: this.$t('common.signUp'), value: 0 },
        { label: this.$t('financemanager.realNameRegistration'), value: 1 },
        { label: this.$t('financemanager.invite'), value: 2 },
        { label: this.$t('financemanager.marketMaking'), value: 3 },
        { label: this.$t('financemanager.other'), value: 4 },
        { label: this.$t('financemanager.userAssetRecovery'), value: 6 },
        { label: this.$t('financemanager.recoveryOfContractAssets'), value: 7 }
      ],
      stateOptions: [
        { label: this.$t('dbmanager.unreviewed'), value: 0 },
        { label: this.$t('financemanager.alreadyPassed'), value: 1 },
        { label: this.$t('financemanager.rejected'), value: 2 }
      ],
      transferOptions: [
        { label: this.$t('financemanager.untransferred'), value: 0 },
        { label: this.$t('financemanager.successfulAccountAllocation'), value: 1 },
        { label: this.$t('financemanager.accountAllocationFailure'), value: 2 },
        { label: this.$t('financemanager.targetAccountIsSuccessfullyEnrolled'), value: 3 },
        { label: this.$t('financemanager.targetAccountEntryFailed'), value: 4 }
      ],
      configId: '',
      date: '',
      excelSuccessTableData: [],
      errorExcelState: 'unknown', // 'unknown', 'pending', 'over'
      errorExcelList: [],
      tableData: [{}]
      // params: {
      //   sceneType: '',
      //   currencyId: '',
      //   batchNumber: '',
      //   uid: '',
      //   sTime: '',
      //   eTime: '',
      //   pageNum : this.pageNum,
      //   pageSize : this.pageSize
      // },
    }
  },
  created() {
    this.getList()
    this.taskResultPolling()
  },
  methods: {

    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getList()
      }
    },
    // ...mapActions('systemsetting', ['getCurrency']),
    // 文件上传
    handleChange(file) {
      this.form.batchNumber = getNowFormatDate()
      this.form.file = file.raw
      this.fileName = file.name
    },
    getList() {
      const params = {
        sceneType: '',
        currencyId: '',
        batchNumber: '',
        uid: '',
        sTime: '',
        eTime: '',
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      freeListadd(params).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 批量上传
    batchAdd() {
      if (!this.form.file) {
        this.$message({
          type: 'error',
          message: this.$t('financemanager.unuploadedFile')
        })
        return
      }

      recoveryBatchadd(this.form).then(response => {
        if (response.code !== 200) return

        this.taskResultPolling()
        this.getList()
        this.$message({ type: 'success', message: this.$t('financemanager.batchAddSucceeded') })
      })
    },
    taskResultPolling: (() => {
      let timer = null
      let registerBeforeDestroyHook = false

      const fn = async function() {
        try {
          const { data } = await getBatchRecordList() || {}

          this.errorExcelState = !Array.isArray(data) || !data.length || data.at(-1).status === 1 ? 'over' : 'pending'
          this.excelSuccessTableData = this.errorExcelState === 'over' && data.at(-1) ? data.at(-1).list : []
          this.errorExcelList = data || []

          if (this.errorExcelState === 'over') clearTimeout(timer)
          else timer = setTimeout(fn.bind(this), 5 * 1000)
        } catch (e) {
          timer = setTimeout(fn.bind(this), 5 * 1000)
          console.error(e.message)
        }
      }

      return function() {
        clearTimeout(timer)
        fn.call(this) // execute immediately
        timer = setTimeout(fn.bind(this), 5 * 1000)

        if (!registerBeforeDestroyHook && (registerBeforeDestroyHook = true)) {
          this.$once('hook:beforeDestroy', () => {
            timer = null
            registerBeforeDestroyHook = false
            clearTimeout.bind(null, timer)
          })
        }
      }
    })(),
    async downErrorFile(batchId) {
      const { code, data } = await getExcelFileName(batchId)

      if (code !== 200) return

      this.taskResultPolling() // updateRecordList

      this.download(data.fileName)
    },
    // 下载模版
    downLoad() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/giftCoinTemplate.xlsx')
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
