<template>
  <!-- 上币申请管理index -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item :label="$t('financemanager.currencyCode')" prop="currencyId">
        <el-select v-model="form.currencyId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="state">
        <el-select v-model="form.auditStatus" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">{{ $t('common.search') }}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">{{ $t('systemsetting.addApplication') }}</el-button>

    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="code" :label="$t('financemanager.currencyCode')" align="center" />
      <el-table-column prop="chainProtocol" :label="$t('systemsetting.chainType')" align="center" />
      <el-table-column prop="contractAddress" width="100" :label="$t('systemsetting.currencyAddress')" align="center" />
      <el-table-column prop="contractPrecision" :label="$t('contractmanager.currencyAccuracy')" align="center" />
      <el-table-column prop="depositMin" width="120" :label="$t('systemsetting.text')" align="center" />
      <el-table-column prop="noAuthDay" width="170" :label="$t('systemsetting.text1')" align="center" />
      <el-table-column prop="authLevelLowDay" width="190" :label="$t('systemsetting.text2')" align="center" />
      <el-table-column prop="authLevelHighDay" width="190" :label="$t('systemsetting.text3')" align="center" />
      <el-table-column prop="withdrawFee" width="120" :label="$t('systemsetting.text4')" align="center" />
      <el-table-column prop="transferHeatThreshold" width="120" :label="$t('systemsetting.text5')" align="center" />
      <el-table-column prop="balanceWarningThreshold" width="120" :label="$t('systemsetting.text6')" align="center" />
      <el-table-column prop="hottocoldReserve" width="120" :label="$t('systemsetting.text7')" align="center" />
      <el-table-column prop="gas" width="120" :label="$t('dwmanager.serviceCharge')" align="center" />
      <el-table-column prop="auditStatus" width="120" :label="$t('common.status')" align="center">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</el-button> -->
          <span v-if="scope.row.auditStatus === 'UnAudit'">{{ $t('dbmanager.unreviewed') }}</span>
          <span v-else-if="scope.row.auditStatus === 'Auditing'">{{ $t('contractmanager.toBeReviewed') }}</span>
          <span v-else-if="scope.row.auditStatus === 'Refused'">{{ $t('financemanager.rejected') }}</span>
          <span v-else-if="scope.row.auditStatus === 'Pass'">{{ $t('systemsetting.checked') }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="auditReport" width="120" :label="$t('systemsetting.causeOfRejection')" align="center" />
      <el-table-column prop="walletDeploy" width="120" :label="$t('systemsetting.walletConfigurationState')" align="center">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</el-button> -->
          <span v-if="scope.row.walletDeploy === 'UnDeployed'">{{ $t('systemsetting.notConfigured') }}</span>
          <span v-else-if="scope.row.walletDeploy === 'Deployed'">{{ $t('systemsetting.configured') }}</span>
          <!-- <span v-else-if="scope.row.walletDeploy === 'DeployFail'">钱包部署错误</span> -->
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column width="200" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</el-button> -->
          <!--          <el-popover ref="popover"-->
          <!--            placement="left"-->
          <!--            width="600"-->
          <!--            trigger="manual"-->
          <!--            v-model="scope.row.visible">-->
          <!--内容-->
          <!--            <div>-->
          <!-- 币种代码 链类型
                合约地址 合约精度  币种地址 币种精度
                单次充币最小值 快速上账确认数
                单次提币最小值 安全上账确认数
                单次提币最大值 单日提币最大值(未认证）
                单日提币最大值(初级认证） 单日提币最大值(高级认证）
                提币（手续费） 用转热归集阈值
                余额预警阈值 热转冷预留
                热转冷阈值 钱包币种名称 -->
          <!-- <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm"> -->
          <!-- @cancel="modify(scope.row)" @confirm="confirmModify($event, scope.row) -->
          <!--              <sb-form :formData="scope.row" >-->
          <!--                <template v-slot="formData">-->
          <!--                  <el-button size="mini" @click="modify(scope.row)">{{ $t('common.cancel') }}</el-button>-->
          <!--                  <el-button size="mini" type="primary" @click="confirmModify(formData.formData, scope.row)">{{ $t('common.preserve') }}</el-button>-->
          <!--                </template>-->
          <!--              </sb-form>-->
          <!--            </div>-->
          <!--            <el-button v-if="scope.row.auditStatus === 'UnAudit' || scope.row.auditStatus === 'Refused' || !scope.row.auditStatus" slot="reference" type="primary" size="mini" @click="modify(scope.row)">{{ $t('common.modify') }}</el-button>-->
          <!--          </el-popover>-->
          <el-button v-if="scope.row.auditStatus === 'UnAudit' || scope.row.auditStatus === 'Refused' || !scope.row.auditStatus" slot="reference" type="primary" size="mini" @click="modify(scope.row)">{{ $t('common.modify') }}</el-button>
          <el-button v-if="scope.row.auditStatus === 'UnAudit' || scope.row.auditStatus === 'Refused' || !scope.row.auditStatus" type="primary" size="mini" @click="submitCheck(scope.row)">{{ $t('systemsetting.submitForReview') }}</el-button>
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
        @pagination="getConfigList"
      />
    </div>
    <el-dialog :title="$t('systemsetting.addApplication')" :visible.sync="open" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item class="grid-item" :label="$t('financemanager.currencyCode')" label-width="auto" prop="code">
          <el-input v-model="digform.code" :placeholder="$t('systemsetting.text8')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.chainType')" prop="chainProtocol">
          <el-select v-model="digform.chainProtocol" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in chainProtocolOptions"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.contractAddress')" prop="contractAddress">
          <el-input v-model="digform.contractAddress" clearable />
        </el-form-item>
        <!-- contractPrecision -->
        <el-form-item class="grid-item" :label="$t('systemsetting.contractAccuracy')" prop="contractPrecision">
          <el-input v-model="digform.contractPrecision" :placeholder="$t('systemsetting.text9')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.minimumValueOfASingleCharge')" prop="depositMin">
          <el-input v-model="digform.depositMin" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text10')" prop="depositQuick">
          <el-input v-model="digform.depositQuick" :placeholder="$t('systemsetting.text9')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text11')" prop="withdrawMin">
          <el-input v-model="digform.withdrawMin" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text12')" prop="depositConfirm">
          <el-input v-model="digform.depositConfirm" :placeholder="$t('systemsetting.text9')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text13')" prop="withdrawMax">
          <el-input v-model="digform.withdrawMax" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text14')" prop="noAuthDay">
          <el-input v-model="digform.noAuthDay" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text15')" prop="authLevelLowDay">
          <el-input v-model="digform.authLevelLowDay" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text16')" prop="authLevelHighDay">
          <el-input v-model="digform.authLevelHighDay" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text4')" prop="withdrawFee">
          <el-input v-model="digform.withdrawFee" :placeholder="$t('systemsetting.text17')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text5')" prop="transferHeatThreshold">
          <el-input v-model="digform.transferHeatThreshold" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text6')" prop="balanceWarningThreshold">
          <el-input v-model="digform.balanceWarningThreshold" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text7')" prop="hottocoldReserve">
          <el-input v-model="digform.hottocoldReserve" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text18')" prop="hottocoldThreshold">
          <el-input v-model="digform.hottocoldThreshold" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.text19')" prop="walletCurrencyName">
          <el-input v-model="digform.walletCurrencyName" :placeholder="$t('systemsetting.text20')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Gas:" prop="walletCurrencyName">
          <el-input v-model="digform.gas" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">{{ $t('common.preserve') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('common.modify')" :visible.sync="editDialog" width="1000px">
      <sb-form :form-data="sbFormData">
        <template v-slot="formData">
          <el-button size="mini" @click="editDialog = false">{{ $t('common.cancel') }}</el-button>
          <el-button size="mini" type="primary" @click="confirmModify(formData.formData, sbFormData)">{{ $t('common.preserve') }}</el-button>
        </template>
      </sb-form>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/systemsetting/currencyapply'
import { queryInfo } from '@/api/configmanage'
import sbForm from './sbForm'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Currencyapply',
  components: {
    sbForm
  },
  data() {
    var checkCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('systemsetting.text20')))
      }
      var reg = /[^\w]/g
      if (value) {
        if (reg.test(value) || value.length > 20) {
          return callback(new Error(this.$t('systemsetting.text20')))
        } else {
          callback()
        }
      }
    }
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
        } else {
          callback()
        }
      }
    }
    // 校验合约精度
    const checkContractPrecision = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
      }
      callback()
    }
    var checkNumber1 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
      }
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
        } else {
          callback()
        }
      }
    }
    var checkNumber2 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value) && Number(value) !== 0) {
          return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
        } else {
          callback()
        }
      }
    }
    var checkNumber3 = (rule, value, callback) => {
      if (Number.isNaN(+value) || +value < 0) {
        return callback(new Error(this.$t('systemsetting.text17')))
      } else {
        callback()
      }
    }
    return {
      sbFormData: {},
      editDialog: false,
      stateOptions: [
        { label: this.$t('common.all'), value: '' },
        { label: this.$t('dbmanager.unreviewed'), value: 'UnAudit' },
        { label: this.$t('contractmanager.toBeReviewed'), value: 'Auditing' },
        { label: this.$t('financemanager.rejected'), value: 'Refused' },
        { label: this.$t('systemsetting.checked'), value: 'Pass' }
      ],
      codeOptions: [],
      symbolTags: [],
      pageShow: true,
      total: 0,
      form: {
        currencyId: '',
        auditStatus: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      open: false,
      ruleForm: { visible: false },
      rules: {},
      digform: {
        code: '',
        chainProtocol: 'ERC20',
        contractAddress: '',
        showPrecision: '',
        depositMin: '',
        depositQuick: '',
        depositConfirm: '',
        withdrawMin: '',
        withdrawMax: '',
        noAuthDay: '',
        authLevelLowDay: '',
        authLevelHighDay: '',
        withdrawFee: '',
        transferHeatThreshold: '',
        balanceWarningThreshold: '',
        hottocoldReserve: '',
        hottocoldThreshold: '',
        walletCurrencyName: '',
        contractPrecision: '',
        gas: ''
      },
      rules: {
        code: [
          { required: true, validator: checkCode, trigger: 'blur' }
        ],
        chainProtocol: [
          { required: true, message: this.$t('app.selectChainType'), trigger: 'change' }
        ],
        contractPrecision: [
          { required: true, validator: checkContractPrecision, trigger: 'blur' }
        ],
        depositMin: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        depositQuick: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        depositConfirm: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        withdrawMin: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        withdrawMax: [
          { required: true, validator: checkNumber2, trigger: 'blur' }
        ],
        noAuthDay: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        authLevelLowDay: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        authLevelHighDay: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        withdrawFee: [
          { required: true, validator: checkNumber3, trigger: 'blur' }
        ],
        transferHeatThreshold: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        balanceWarningThreshold: [
          { required: true, validator: checkNumber, trigger: 'change' }
        ],
        hottocoldReserve: [
          { required: true, validator: checkNumber, trigger: 'change' }
        ],
        hottocoldThreshold: [
          { required: true, validator: checkNumber, trigger: 'change' }
        ],
        walletCurrencyName: [
          { required: true, validator: checkCode, trigger: 'blur' }
        ],
        gas: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    ...mapGetters(['uid']),
    // codeOptions() {
    //   return this.currencyList
    // },
    chainProtocolOptions() {
      return this.protocolList
    }
  },
  mounted() {
    this.getCurrency(1)
    this.getProtocol()
    this.getConfigList()
    this.getSymbolTags()
    this.getCurrencyList()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency', 'getProtocol']),
    // 获取币种代码
    getCurrencyList() {
      API.getCurrencyList().then(res => {
        this.codeOptions = res.data
      })
    },
    // 修改上币内容
    modify(row) {
      // row.visible = !row.visible;
      // this.$set(row, 'visible', !row.visible)
      this.sbFormData = row
      this.editDialog = true
    },
    confirmModify(formData, row) {
      formData = Object.assign(formData, { id: row.id, chainId: row.chainId })
      const newObj = {
        ...formData,
        showPrecision: formData.contractPrecision
      }
      API.updateApply(newObj).then(res => {
        if (res.code === 200) {
          this.msgSuccess(this.$t('common.modifySuccess'))
          // this.modify(row)
          this.editDialog = false
          this.getConfigList()
        }
      })
    },
    // 提交审核
    submitCheck(row) {
      API.submitCheck({ id: row.id, auditStatus: 'Auditing', userId: this.uid }).then(res => {
        if (res.code === 200) {
          this.msgSuccess(this.$t('usermanage.text22'))
          this.getConfigList()
        }
      })
    },
    resetQuery() {
      this.form.code = ''
      this.form.state = ''
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList() {
      this.$refs.table.doLayout()
      const param = {}
      Object.keys(this.form).forEach(item => {
        if (this.form[item]) {
          param[item] = this.form[item]
        }
      })
      API.getList(param).then(response => {
        if (response.code == 200) {
          console.log('table值', response.rows)
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getSymbolTags() {
      queryInfo({ 'configKey': 'symbol_tags' }).then(response => {
        if (response.code == 200) {
          this.symbolTags = response.data.tags
        } else {
          this.msgError(response.msg)
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          console.log('提交参数', this.digform)
          const obj = {
            ...this.digform,
            showPrecision: this.digform.contractPrecision
          }
          API.addApply(obj).then(response => {
            if (response.code == 200) {
              this.msgSuccess(this.$t('common.addSuccess'))
              this.cancel()
              this.getConfigList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    addConfig(row) {
      this.open = true
      this.digform = {}
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
.demo-ruleForm {
  .el-form-item {
    float: left;
  }
}
</style>
