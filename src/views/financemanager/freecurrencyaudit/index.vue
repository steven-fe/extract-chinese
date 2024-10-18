<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="150px">
      <el-form-item :label="$t('financemanager.businessScenario')" prop="sceneType">
        <el-select v-model="form.sceneType" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptionsFilter"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currencyId">
        <el-select v-model="form.currencyId" style="width: 100%" filterable :placeholder="$t('financemanager.currencyCode1')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.batch')">
        <el-input v-model="form.batchNumber" :placeholder="$t('financemanager.complimentaryLot1')" clearable />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="state">
        <el-select v-model="form.state" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.useruid')">
        <el-input v-model="form.uid" :placeholder="$t('financemanager.pleaseEnterUserUID')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.noteOfGift')">
        <el-input v-model="form.remark" :placeholder="$t('financemanager.pleaseEnterTheTokenRemarks')" clearable />
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
          v-model="date2"
          type="datetime"
          :start-placeholder="$t('common.endTime')"
          align="right"
          value-format="timestamp"
          @change="timeChange2"
        />
      </el-form-item>
      <el-form-item :label="$t('financemanager.businessType')" prop="sceneType">
        <el-select v-model="form.businessType" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in businessTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportData">{{ $t('common.derive') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportDataAll">{{ $t('financemanager.exportAll') }}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="beforeAudit(true, 1)">{{ $t('financemanager.batchPass') }}</el-button>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="beforeAudit(true, 2)">{{ $t('financemanager.batchRejection') }}</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table" @selection-change="handleSelectionChange">
      <el-table-column :label="$t('common.operation')" width="220px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.state !== 0">- -</span>
          <div v-else>
            <el-button type="primary" size="mini" @click="beforeAudit(false, 1, scope.row.id)">{{ $t('financemanager.pass') }}</el-button>
            <el-button type="danger" size="mini" @click="beforeAudit(false, 2, scope.row.id)">{{ $t('usermanage.turnDown') }}</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column prop="batchNumber" :label="$t('financemanager.giftLot')" align="center" width="140" />
      <el-table-column :label="$t('financemanager.actualDateOfGift')" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.transferTime | timeFilter }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.businessScenario')" align="center">
        <template slot-scope="scope">{{ typeLabel(typeOptions, scope.row.sceneType) }}</template>
      </el-table-column>
      <el-table-column prop="uid" :label="$t('financemanager.userUID')" align="center" width="160" />
      <el-table-column prop="userName" :label="$t('financemanager.userName')" align="center" />
      <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
      <el-table-column prop="volume" :label="$t('financemanager.quantityOfGift')" align="center" width="100" />
      <el-table-column prop="remark" :label="$t('financemanager.noteOfGift')" align="center" width="200" />
      <el-table-column prop="operator" :label="$t('financemanager.operatorName')" align="center" width="100" />
      <el-table-column prop="chainProtocol" :label="$t('financemanager.dateOfApplicationForGift')" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.createdAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="reviewer" :label="$t('financemanager.nameOfReviewer')" align="center" width="100" />
      <el-table-column :label="$t('contractmanager.auditTime')" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.reviewTime | timeFilter }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.reasonsForTheFailureOfTheGift')" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.errorReason }}</template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center">
        <!--        // -1:全部 0:未审核 1:已通过 2:已拒绝/未通过 3:已通过——赠币已完成 4:已通过——赠币失败-->
        <template slot-scope="scope">{{ typeLabel(stateOptions, scope.row.state) }}</template>
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
    <el-dialog :title="$t('financemanager.localGiftTaskInformation')" :visible.sync="dialogStatus" width="500px" :before-close="commonCancel" :close-on-click-modal="false">
      {{ $t('financemanager.giftCurrencyName') }}：
      <div v-for="(item, index) in accountInfo.currencyCodes" :key="`${index}a`" style="line-height: 30px">{{ item }}</div>
      <br>
      {{ $t('financemanager.totalNumberOfCoinsDonated') }}：
      <div v-for="(item, index) in accountInfo.currentGiftCoinInfos" :key="`${index}b`" style="line-height: 30px">{{ item.currencyCode }}：{{ item.amount }}</div>
      <br>
      {{ $t('financemanager.numberOfCoinsRemainingInTheGiftAccount') }}：
      <div v-for="(item, index) in accountInfo.giftCoinAccountInfos" :key="`${index}c`" style="line-height: 30px">{{ item.currencyCode }}：{{ item.amount }}</div>
      <br>
      {{ $t('financemanager.numberOfCoinsRemainingInTheGiftAccountSuccess') }}：
      <div v-for="(item, index) in accountInfo.giftCoinRemainingInfos" :key="`${index}d`" style="line-height: 30px">{{ item.currencyCode }}：{{ item.amount }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="commonCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="audit">{{ $t('financemanager.passedTheGiftAuditWithoutError') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="$t('common.prompt')" :visible.sync="dialogTip" width="500px" :close-on-click-modal="false">
      {{ $t('financemanager.insufficientAvailableBalanceInTheGiftAccount') }}：
      <div v-for="(item, index) in accountInfo.giftCoinBalanceInsufficient" :key="`${index}e`" style="line-height: 30px">{{ item.currencyCode }}：{{ item.amount }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="dialogTip = false">{{ $t('common.Confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { freeAuditList, audit, exportData, exportDataAll, authTaskInfo } from '@/api/finance/freecurrency'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'

export default {
  name: 'Freecurrencyaudit',
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
      dialogTip: false,
      dialogStatus: false,
      accountInfo: {
        balanceEnough: 0, // 余额是否充足  0:不足 1:充足
        currencyCodes: [], // 币种
        currentGiftCoinInfos: [], // 本次赠币个数总和
        giftCoinAccountInfos: [], // 赠币账户剩余币种个数
        giftCoinBalanceInsufficient: [], // 账户余额不足
        giftCoinRemainingInfos: [] // 赠币完成后剩余赠币账户剩余币种个数
      },
      businessTypeList: [
        { label: this.$t('usermanage.giftCurrency'), value: 1 },
        { label: this.$t('financemanager.recycle'), value: 2 }
      ],
      typeOptions: [
        { label: this.$t('common.signUp'), value: 0 },
        { label: this.$t('financemanager.realNameRegistration'), value: 1 },
        { label: this.$t('financemanager.invite'), value: 2 },
        { label: this.$t('financemanager.marketMaking'), value: 3 },
        { label: this.$t('financemanager.other'), value: 4 },
        { label: this.$t('financemanager.userAssetRecovery'), value: 6 }
      ],
      stateOptions: [
        // -1:全部 0:未审核 1:已通过 2:已拒绝/未通过 3:已通过——赠币已完成 4:已通过——赠币失败
        { label: this.$t('common.all'), value: -1 },
        { label: this.$t('dbmanager.unreviewed'), value: 0 },
        { label: this.$t('financemanager.alreadyPassed'), value: 1 },
        { label: this.$t('financemanager.rejected'), value: 2 },
        { label: this.$t('financemanager.giftHasBeenComplete'), value: 3 },
        { label: this.$t('financemanager.giftFailure'), value: 4 }
      ],
      total: 0,
      configId: '',
      form: {
        businessType: 1,
        sceneType: '',
        currencyId: '',
        batchNumber: '',
        uid: '',
        state: '',
        remark: '',
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      date2: '',
      selectArr: [],
      tableData: [{}],
      auditParams: {},
      formParams: {}// 记录搜索条件
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    },
    typeOptionsFilter() {
      return this.typeOptions.slice(0, 4)
    }
  },
  mounted() {
    this.getCurrency(1)
    this.getConfigList()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 导出
    exportData() {
      this.form.pageName = this.$t('financemanager.grantReview')
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
    // 导出全部
    exportDataAll() {
      this.form.pageName = this.$t('financemanager.grantReview')
      exportDataAll(this.form).then(res => {
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
        return el.state.toString() !== '0'
      })
      const arr1 = val.filter(el => {
        return el.state.toString() === '0'
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
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 开始日期改变事件
    timeChange1(val) {
      if (val) {
        this.form.sTime = val
        return
      }
      this.form.sTime = ''
    },
    // 结束日期改变事件
    timeChange2(val) {
      if (val) {
        this.form.eTime = val
        return
      }
      this.form.eTime = ''
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      freeAuditList(this.form).then(response => {
        if (response.code == 200) {
          this.formParams = Object.assign({}, this.form)
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    beforeAudit(flag, state, id) {
      const params = {
        id: [id],
        state: state,
        businessType: this.formParams.businessType
      }
      if (flag && this.selectArr.length === 0) {
        this.$message({
          type: 'info',
          message: this.$t('financemanager.pleaseSelectBatchAuditItems')
        })
        return
      }
      if (flag) {
        params.id = this.selectArr
      }
      this.auditParams = params
      if (state === 1 && this.formParams.businessType === 1) {
        authTaskInfo(params).then(res => {
          this.accountInfo = res.data
          if (this.accountInfo.balanceEnough === 1) {
            this.dialogStatus = true
          }
          if (this.accountInfo.balanceEnough === 0) {
            this.dialogTip = true
          }
        })
      } else {
        this.audit()
      }
    },
    // 审核通过、驳回
    audit() {
      this.$confirm(this.$t('financemanager.whetherToReviewTheItem'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        audit(this.auditParams).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: this.$t('common.successfulAudit')
            })
            this.dialogStatus = false
            this.getConfigList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('financemanager.auditCancellation')
        })
      })
    },
    commonCancel() {
      this.dialogStatus = false
      this.auditParams = this.$options.data().auditParams
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
