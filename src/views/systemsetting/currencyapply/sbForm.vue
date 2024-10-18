<template>
  <div>
    <el-form
      ref="digform"
      :model="digform"
      :rules="rules"
      :disabled="disabled"
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
        <el-input v-model="digform.withdrawFee" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
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
      <el-form-item v-if="status === 'audit'" class="grid-item" :label="$t('systemsetting.submitterID')">
        <el-input :value="formData.applyUserId" placeholder="" clearable />
      </el-form-item>
      <el-form-item v-if="status === 'audit'" class="grid-item" :label="$t('usermanage.submissionTime')">
        <el-input :value="formData.applyTime | formatate" placeholder="" clearable />
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('systemsetting.fee')" prop="walletCurrencyName">
        <el-input v-model="digform.gas" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <slot :formData="digform" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: 'SbForm',
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: ''
    }
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
    return {
      digform: {
        code: '',
        chainProtocol: 'ERC20',
        contractAddress: '',
        contractPrecision: '',
        showPrecision: '',
        depositMin: '',
        depositQuick: '',
        depositConfirm: '123',
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
          { required: true, validator: checkNumber2, trigger: 'blur' }
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
    chainProtocolOptions() {
      return this.protocolList
    }
  },
  watch: {
    formData: {
      handler(val) {
        this.init()
      },
      deep: true
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.formData) {
        this.formData.chainProtocol = this.formData.chainProtocol.toUpperCase()
        Object.keys(this.digform).forEach(item => {
          this.digform[item] = this.formData[item]
        })
      }
    },
    setConfig() {
      this.$emit('confirm', this.digform)
    },
    cancel() {
      this.$emit('cancel')
    }
  },
  filters: {
    formatate(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped lang="scss">
.form-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
  }
}
.dialog-footer {
    float: right;
}
</style>
