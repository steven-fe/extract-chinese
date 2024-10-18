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
      <el-button type="primary" size="mini" @click="balance">
        {{ $t('financemanager.systemAccountBalance') }}
      </el-button>
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
      <el-table-column fixed="right" align="center" :label="$t('common.operation')" width="250">
        <template slot-scope="scope">
          <div v-if="scope.row.capitalStatus === '待审核'">
            <el-button size="mini" type="primary" @click="through(scope.row)">
              {{ $t('contractmanager.pass') }}
            </el-button>
            <el-button type="warning" size="mini" @click="rejected(scope.row)">{{ $t('usermanage.turnDown') }}</el-button>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination v-show="total > 0" :total="total" :page.sync="form.pageNum" :limit.sync="form.pageSize" @pagination="getConfigList" />
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
      <div v-if="state === 1">
        <el-form ref="ruleForm1" :inline="true" :model="form1" size="mini">
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
      <div v-if="state === 2 || state === 3" class="through">
        <ul>
          <li>
            <span>{{ $t('common.capitalIncreaseAccountName') }}</span>
            <span>{{ dialogData.accountName }}{{ dialogData.accountId }}</span>
          </li>
          <li>
            <span>{{ $t('common.theCurrencyOfTheCapitalIncrease') }}</span>
            <span>{{ dialogData.currencyName }}</span>
          </li>
          <li>
            <span>{{ $t('common.capitalIncrease') }}</span>
            <span>{{ dialogData.volume }}</span>
          </li>
          <li>
            <p>{{ $t('common.remarksOnCapitalIncrease') }}:</p>
            <p class="remak">{{ dialogData.remarks }}</p>
          </li>
        </ul>
        <el-form ref="ramarkForm" :rules="rulesRemark" :model="ramarkForm">
          <el-form-item :label="$t('common.auditRemarks')" prop="desc">
            <el-input v-model="ramarkForm.desc" type="textarea" rows="6" resize="none" :placeholder="$t('common.inputAuditRemarks')" />
          </el-form-item>
        </el-form>
      </div>
    </Dialog>
    <!-- ga验证弹窗 -->
    <GaExamine :ga-show="gaShow" @close1="close1" />
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import Dialog from '../../../components/Dialog/index.vue'
import GaExamine from '../../../components/GaExamine/index.vue'
import { getTabList, getAssetsList, listExport } from '@/api/finance/increase'
import { formatDate } from '@/utils/index.js'
export default {
  name: 'IncreaseAssManagement',
  components: {
    Dialog,
    GaExamine
  },
  data() {
    return {
      time: null,
      // 记录撤资还是销资
      state: 0,
      // 提交按钮文本
      submit: this.$t('common.submit'),
      cancelButton: this.$t('common.cancel'),
      // 总条数
      total: 0,
      // 导出数组
      exportList: [],
      // 接收通过驳回数据对象
      dialogData: {},
      // 标题
      dialogTitle: '',
      // 弹框的出现与否
      isShowCancel: true,
      // 是否显示取消按钮
      dialogVisible: false,
      // 系统账户余额表格
      dialogOldData: [],
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
        pageSize: 30
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
      // 系统账号余额表单
      form1: {
        currencyId: '' // 币种id
      },
      // 顶部状态
      status: [{ label: this.$t('contractmanager.toBeReviewed'), value: 1 }, { label: this.$t('contractmanager.pass'), value: 2 }, { label: this.$t('usermanage.turnDown'), value: 3 }],
      // ga弹窗
      gaShow: {
        flag: false,
        loginForm: {}
      },
      // 用户账号密码
      loginForm: {
        phoneNumber: '',
        password: ''
      },
      // 表格数据
      tableData: [],
      // 审核备注
      ramarkForm: { desc: '' },
      // 系统账户表格头部
      dialogTabs: [{ name: this.$t('common.coin'), prop: 'currencyName' }, { name: this.$t('financemanager.balance'), prop: 'total' }],
      // 增资弹框验证规则
      rulesRemark: {
        desc: { required: true, message: this.$t('common.inputAuditRemarks') }
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    // 币种列表
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
    this.getConfigList()
    this.getAssetsList()
    // 深拷贝 账户余额数据
    this.getCurrency(1)
  },
  methods: {
    // 勾选
    handleSelectionChange(val) {
      this.exportList = val
    },
    /** * 初始化 表格数据, 币种数据, 系统账户余额数据 ***/
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
    /** * 关闭弹窗 按钮数据 ***/
    // 点击取消的事件
    resetPopupData() {
      //  这里可重置数据
      if (this.state === 1) {
        this.resetForm()
      } else {
        this.dialogVisible = false
        this.$refs['ramarkForm'].resetFields()
      }
    },
    // 点击确定的按钮
    submitPopupData() {
      if (this.state === 1) {
        this.resetForm()
      } else {
        this.$refs['ramarkForm'].validate(valid => {
          if (valid) {
            this.gaShow = {
              flag: true,
              loginForm: {
                id: this.dialogData.id,
                examineRemarks: this.ramarkForm.desc,
                googleCode: '',
                capitalStatus: this.state
              }
            }
          } else {
            return false
          }
        })
      }
    },
    // 关闭弹框（头部的X）
    handleClose() {
      this.dialogVisible = false
      if (this.state === 1) {
        this.form1.currencyId = ''
        this.search()
      } else {
        this.$refs['ramarkForm'].resetFields()
      }
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
    /** * 点击系统账户余额 通过按钮 驳回按钮 提交ga验证 ***/
    // 系统账户余额
    balance() {
      this.dialogTableData = this.dialogOldData
      this.isShowCancel = false
      this.submit = this.$t('systemsetting.closed')
      this.state = 1
      this.dialogVisible = true
      this.dialogTitle = this.$t('financemanager.systemAccountBalance')
    },
    // 通过
    through(row) {
      this.dialogData = {
        ...row
      }
      this.state = 2
      this.isShowCancel = true
      this.submit = this.$t('contractmanager.pass')
      this.dialogTitle = this.$t('common.passVerification')
      this.dialogVisible = true
    },
    // 驳回
    rejected(row) {
      this.dialogData = {
        ...row
      }
      this.state = 3
      this.isShowCancel = true
      this.submit = this.$t('usermanage.turnDown')
      this.dialogTitle = this.$t('common.rejectedAudit')
      this.dialogVisible = true
    },
    // 提交ga验证
    close1(value) {
      this.loading = false
      this.gaShow.flag = false
      this.getAssetsList()
      this.getConfigList()
      if (value === 1) {
        this.dialogVisible = false
        this.$refs['ramarkForm'].resetFields()
      }
    },
    /** * 初始化表单数据 ***/
    resetForm() {
      this.dialogVisible = false
      this.form1.currencyId = ''
      this.search()
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
  .through {
    ul {
      padding: 0;
      li {
        margin-bottom: 20px;
        list-style: none;
        display: flex;
        justify-content: space-between;
        .remak {
          text-indent: 10px;
        }
      }
    }
    ::v-deep .el-form-item__label {
      float: none;
    }
    ::v-deep .el-form-item--medium .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>
