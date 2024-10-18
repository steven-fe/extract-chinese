<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" size="mini">
      <!-- 币种 -->
      <el-form-item :label="$t('common.coin')" prop="codeOptions">
        <el-select v-model="form.currencyId" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')" filterable>
          <el-option value="" :label="$t('common.all')" />
          <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <!-- 类型 -->
      <el-form-item :label="$t('financemanager.type')">
        <el-select v-model="form.capitalType" style="width: 100%">
          <el-option value="" :label="$t('common.all')" />
          <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 状态 -->
      <el-form-item :label="$t('common.status')">
        <el-select v-model="form.capitalStatus" style="width: 100%">
          <el-option value="" :label="$t('common.all')" />
          <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 时间-->
      <el-form-item :label="$t('financemanager.time')">
        <el-date-picker v-model="time" type="datetimerange" align="right" value-format="timestamp" :placeholder="$t('financemanager.selectDateAndTime')" :start-placeholder="$t('common.startTime')" :end-placeholder="$t('common.endTime')" />
      </el-form-item>
      <!-- 搜索 导出 全部 -->
      <el-form-item>
        <el-button type="primary" size="mini" @click="getConfigList(true)">
          {{ $t('common.search') }}
        </el-button>
        <el-button type="primary" size="mini" @click="exportOne('one')">
          {{ $t('common.derive') }}
        </el-button>
        <el-button type="primary" size="mini" @click="exportOne('all')">
          {{ $t('financemanager.exportAll') }}
        </el-button>
      </el-form-item>
    </el-form>
    <div class="top-right">
      <el-button type="success" icon="el-icon-plus" size="mini" @click="add">
        {{ $t('financemanager.capitalIncrease') }}
      </el-button>
      <el-button type="warning" icon="el-icon-plus" size="mini" @click="eliminate">
        {{ $t('financemanager.saleOfFunds') }}
      </el-button>
      <el-button type="primary" size="mini" @click="balance">{{ $t('financemanager.systemAccountBalance') }}</el-button>
    </div>
    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="40" />
      <el-table-column v-for="item in tabs" :key="item.type" :label="item.name" align="center" :prop="item.prop" :width="item.w">
        <template slot-scope="{ row }">
          <div>
            {{ row[item.prop] || '—' }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination v-show="total > 0" :total="total" :page.sync="form.pageNo" :limit.sync="form.pageSize" @pagination="getConfigList" />
    </div>
    <!-- 弹窗 -->
    <Dialog
      :dialog-title="dialogTitle"
      :visible="dialogVisible"
      :cancel="cancelButton"
      :submit="submit"
      :is-show-cancel="isShowCancel"
      :popup-width="'550px'"
      @handleClose="handleClose"
      @resetPopupData="resetPopupData"
      @submitPopupData="submitPopupData"
    >
      <div v-if="state === 1 || state === 0">
        <el-form ref="ruleForm" :model="addForm" :rules="rules" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="$t('financemanager.dialogTitleIndicatesTheAccountName',{dialogTitle: dialogTitle})">
            <el-input v-model="addForm.user" :disabled="true" />
          </el-form-item>
          <el-form-item :label="$t('financemanager.parameterCurrency',{dialogTitle: dialogTitle})" prop="currencyId" label-width="100%">
            <el-select v-model="addForm.currencyId" placeholder="请选择增资币种" filterable>
              <el-option value="" :label="$t('common.all')" />
              <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('financemanager.parameterAmountOfCapitalIncrease',{dialogTitle: dialogTitle})" prop="volume">
            <el-input v-model="addForm.volume" />
          </el-form-item>
          <el-form-item :label="$t('financemanager.parameterCapitalIncreaseRemarks',{dialogTitle: dialogTitle})" prop="remarks">
            <el-input v-model="addForm.remarks" />
          </el-form-item>
        </el-form>
        <div>
          <p>{{ $t('financemanager.attention') }}</p>
          <p>
            1. {{ $t('financemanager.submitImmediatelyForCapitalIncreaseReview',{dialogTitle: dialogTitle}) }}
          </p>
        </div>
      </div>
      <div v-else>
        <el-form :inline="true" size="mini">
          <el-form-item :label="$t('common.coin')">
            <el-select v-model="form1.currencyId" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')" filterable>
              <el-option value="" :label="$t('common.all')" />
              <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="mini" @click="search()">
              {{ $t('common.search') }}
            </el-button>
          </el-form-item>
        </el-form>
        <div class="dialog-tab">
          <el-table :data="dialogTableData" border style="width: 100%">
            <el-table-column :label="$t('common.orderNumber')" type="index" align="center" width="120" />
            <el-table-column v-for="item in dialogTabs" :key="item.type" :label="item.name" align="center" :prop="item.prop" :width="item.w" />
          </el-table>
        </div>
      </div>
    </Dialog>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { getTabList, getAssetsList, addIncrease, listExport } from '@/api/finance/increase'
import { assetFromUser } from '@/api/finance/freecurrency'
import { formatDate } from '@/utils/index.js'
import Dialog from '../../../components/Dialog'
export default {
  name: 'IncreaseAssManagement',
  components: {
    Dialog
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
      time: null,
      total: 0,
      // 记录撤资还是销资
      state: 0,
      // 导出数组
      exportList: [],
      // 标题
      cancelButton: this.$t('common.cancel'),
      submit: this.$t('common.submit'),
      // 表格数据
      tableData: [],
      // 提交按钮文本
      dialogTitle: '',
      // 是否显示取消按钮
      isShowCancel: true,
      dialogOldData: [],
      // 弹框的出现与否
      dialogVisible: false,
      accountOptions: [],
      // 系统账户余额表格
      dialogTableData: [],
      // 搜索栏 表单数据
      form: {
        // 币种id
        currencyId: '',
        // 类型
        capitalType: '',
        // 状态
        capitalStatus: '',
        // 开始时间
        startTime: '',
        // 结束时间
        endTime: '',
        pageNo: 1,
        pageSize: 10
      },
      // 表格头部栏
      tabs: [
        { name: this.$t('usermanage.submissionTime'), w: 160, prop: 'ctime' },
        { name: this.$t('financemanager.serviceID'), w: 160, prop: 'businessId' },
        { name: this.$t('financemanager.operator'), w: 120, prop: 'operationNickName' },
        { name: this.$t('financemanager.accountNameID'), w: 160, prop: 'accountId' },
        { name: this.$t('financemanager.currency'), w: 120, prop: 'currencyName' },
        { name: this.$t('financemanager.type'), w: 120, prop: 'capitalType' },
        { name: this.$t('common.status'), w: 120, prop: 'capitalStatus' },
        { name: this.$t('financemanager.number'), w: 120, prop: 'volume' },
        { name: this.$t('usermanage.balanceOfAccount'), w: 140, prop: 'balance' },
        { name: this.$t('financemanager.remarksOnCapitalIncrease'), w: 160, prop: 'remarks' },
        { name: this.$t('contractmanager.auditor'), w: 160, prop: 'examineUserNickName' },
        { name: this.$t('contractmanager.auditTime'), w: 160, prop: 'examineTime' },
        { name: this.$t('financemanager.auditRemarks'), w: 120, prop: 'examineRemarks' }
      ],
      // 顶部类型
      types: [{ label: this.$t('financemanager.capitalIncrease'), value: 1 }, { label: this.$t('financemanager.disinvestment'), value: 2 }],
      // 增资弹框验证规则
      rules: {
        currencyId: {
          required: true,
          message: this.$t('financemanager.selectTheParameterCurrency', { dialogTitle: this.dialogTitle })
        },
        volume: { required: true, message: this.$t('financemanager.numberOfInputParameters', { dialogTitle: this.dialogTitle }) },
        remarks: { required: true, message: this.$t('financemanager.pleaseEnterRemarks') }
      },

      // 系统账号余额表单
      form1: {
        currencyId: ''
      },
      // 顶部状态
      status: [{ label: this.$t('contractmanager.toBeReviewed'), value: 1 }, { label: this.$t('contractmanager.pass'), value: 2 }, { label: this.$t('usermanage.turnDown'), value: 3 }],
      // 增资｜销资 弹框表单数据
      addForm: {
        user: '',
        accountId: '',
        currencyId: '',
        volume: '',
        remarks: ''
      },
      // 系统账户表格头部
      dialogTabs: [{ name: this.$t('financemanager.currency'), prop: 'currencyName' }, { name: this.$t('financemanager.balance'), prop: 'total' }],
      // 增资账号名称数组
      fromAccountOptions: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    },
    // 获取币种
    getCurrId() {
      let arr = []
      arr = this.codeOptions.filter(item => item.id === this.addForm.currencyId)
      if (arr.length) {
        return arr[0].name
      }
      return ''
    }
  },
  mounted() {
    // 表格接口
    this.getConfigList()
    this.getAssetsList()
    this.getIncreaseUse()
    this.getCurrency(1)
  },
  methods: {
    /** * 初始化表格数据和币种数据 ***/
    ...mapActions('systemsetting', ['getCurrency']),
    getConfigList(flag) {
      if (flag) {
        this.pageNum = 1
      }
      this.form.startTime = (this.time && this.time[0]) || ''
      this.form.endTime = (this.time && this.time[1]) || ''
      getTabList(this.form).then(response => {
        if (response.code == 200) {
          this.total = response.data.total
          response.data.list.forEach(item => {
            if (item.ctime || item.examineTime) {
              item.ctime = formatDate(item.ctime)
              item.examineTime = formatDate(item.examineTime)
            }
          })
          this.tableData = response.data.list
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** * 增资，销资, 勾选 ***/
    // 勾选
    handleSelectionChange(val) {
      this.exportList = val
    },
    // 增资
    add() {
      this.state = 1
      this.dialogTitle = this.$t('financemanager.capitalIncrease')
      this.initPubDialog()
    },
    // 销资
    eliminate() {
      this.state = 0
      this.dialogTitle = this.$t('financemanager.saleOfFunds')
      this.initPubDialog()
    },
    /** ** 系统账户余额 ****/
    // 系统账户余额
    balance() {
      this.dialogTableData = this.dialogOldData
      this.isShowCancel = false
      this.submit = this.$t('systemsetting.closed')
      this.state = 2
      this.dialogVisible = true
      this.dialogTitle = this.$t('financemanager.systemAccountBalance')
    },
    // 获取系统账户余额列表
    getAssetsList() {
      getAssetsList(this.form1).then(response => {
        if (response.code == 200) {
          this.dialogOldData = response.data.sort((a, b) => {
            return a.currencyName.localeCompare(b.currencyName)
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 系统账户余额搜索
    search() {
      // 判断是否带搜索
      if (this.form1.currencyId === '') {
        this.dialogTableData = this.dialogOldData
      } else {
        this.dialogTableData = this.dialogOldData.filter(item => {
          return item.currencyName === this.form1.currencyId.toString()
        })
      }
    },
    /** * 取消, 确定,关闭 dialog ***/
    // 点击取消的事件
    resetPopupData() {
      //  这里可重置数据
      this.dialogVisible = false
      if (this.state !== 2) {
        this.$refs['ruleForm'].resetFields()
      } else {
        this.form1.currencyId = ''
        this.search()
      }
    },
    // 点击确定的按钮
    async submitPopupData() {
      if (this.state === 2) {
        this.dialogVisible = false
        this.form1.currencyId = ''
        this.search()
      } else {
        const data = {
          accountId: this.fromAccountOptions[0].userId,
          currencyId: this.addForm.currencyId,
          volume: this.addForm.volume,
          remarks: this.addForm.remarks
        }
        // 动态添加表单提交校验规则
        this.rules.currencyId.message = this.$t('financemanager.selectTheParameterCurrency', { dialogTitle: this.dialogTitle })
        this.rules.volume.message = this.$t('financemanager.numberOfInputParameters', { dialogTitle: this.dialogTitle })
        this.$refs['ruleForm'].validate(valid => {
          if (valid) {
            this.$confirm(this.$t('financemanager.tips', { dialogTitle: this.dialogTitle, volume: this.addForm.volume, getCurrId: this.getCurrId }), this.$t('common.prompt'), {
              confirmButtonText: this.$t('common.sure'),
              cancelButtonText: this.$t('common.cancel')
            })
              .then(() => {
                if (this.state === 0) {
                  data.volume = '-' + '' + this.addForm.volume
                }
                addIncrease(data).then(() => {
                  this.$message({
                    type: 'success',
                    message: this.$t('common.operationSucceed')
                  })
                  this.getConfigList()
                  this.getAssetsList()
                  this.dialogVisible = false
                  this.$refs['ruleForm'].resetFields()
                })
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: this.$t('dbmanager.canceled')
                })
              })
          } else {
            return false
          }
        })
      }
    },
    // 关闭弹框（头部的X）
    handleClose() {
      this.dialogVisible = false
      if (this.state !== 2) {
        this.$refs['ruleForm'].resetFields()
      } else {
        this.form1.currencyId = ''
        this.search()
      }
    },
    // 获取增资账号
    getIncreaseUse() {
      assetFromUser().then(res => {
        if (res.code === 200) {
          this.fromAccountOptions = res.data
        }
      })
    },
    // 导出
    exportOne(val) {
      const params = {
        idList: []
      }
      if (val === 'one') {
        if (this.exportList.length > 0) {
          this.exportList.forEach(item => {
            params.idList.push(item.id)
          })
          listExport(params)
            .then(res => {
              return res
            })
            .then(res => {
              this.download(res.msg)
            })
        } else {
          this.$message({
            message: this.$t('financemanager.selectTheDataYouWantToExport'),
            type: 'warning'
          })
        }
      } else {
        if (this.exportList.length === 0) {
          listExport()
            .then(res => {
              return res
            })
            .then(res => {
              this.download(res.msg)
            })
        } else {
          this.$message({
            message: this.$t('financemanager.pleaseRemoveYourCheckBox'),
            type: 'warning'
          })
        }
      }
    },
    initPubDialog() {
      this.submit = this.$t('common.submit')
      this.dialogVisible = true
      this.isShowCancel = true
      this.rules.volume.message = this.$t('financemanager.numberOfInputParameters', { dialogTitle: this.dialogTitle })
      this.rules.currencyId.message = this.$t('financemanager.selectTheParameterCurrency', { dialogTitle: this.dialogTitle })
      this.addForm.user = this.fromAccountOptions[0].name + '' + this.fromAccountOptions[0].userId
    }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  .top-right {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
    border-top: 1px solid #ccc;
    padding-top: 10px;
  }
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
  .demo-ruleForm {
    ::v-deep .el-form-item__content {
      margin-left: 0 !important;
    }
    ::v-deep .el-select {
      width: 100%;
    }
    ::v-deep .el-form-item__label {
      float: none;
      width: 100%;
    }
  }
  // 系统账户余额 表格
  .dialog-tab {
    max-height: 500px;
    overflow-y: scroll;
  }
}
</style>
