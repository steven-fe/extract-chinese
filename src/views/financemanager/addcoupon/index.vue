<template>
  <div class="app-container">
    <el-form
      ref="digform"
      :model="digform"
      :rules="rules"
      class="form-grid"
    >
      <el-form-item class="grid-item" :label="$t('financemanager.businessType')" prop="code">
        <div style="padding-left: 10px;width: 100%;float: left">{{ $t('financemanager.couponGiveaway') }}</div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.giftBatchNumber')" prop="code">
        <div style="padding-left: 10px;width: 100%;float: left">{{ digform.batchNo }}</div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.businessScenario')" prop="bizType">
        <el-select v-model="digform.bizType" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.targetAccountType')" prop="code">
        <div style="padding-left: 10px;width: 100%;float: left">{{ $t('financemanager.couponAccount') }}</div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.giftNote')" prop="remarks">
        <el-input v-model.trim="digform.remarks" :placeholder="$t('financemanager.pleaseEnterRemarks')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.currencyCode')" prop="currencyCode">
        <el-select v-model="digform.currencyCode" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')" filterable>
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.giftQuantity')" prop="giveNumber">
        <el-input v-model.trim="digform.giveNumber" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
      </el-form-item>
      <el-form-item class="grid-item" label="Uid:" prop="userId">
        <el-input v-model="digform.userId" :placeholder="$t('financemanager.pleaseEnterUserUID')" clearable />
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.validUntil')" prop="validTime">
        <div style="float: left; width: 100%;">
          <el-date-picker
            v-model="digform.validTime"
            type="datetime"
            :placeholder="$t('financemanager.selectDateAndTime')"
            align="right"
            value-format="timestamp"
            :picker-options="pickerOptions"
          />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">{{ $t('common.sure') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { insert } from '@/api/finance/coupon'
import { getNowFormatDate } from '@/utils'
export default {
  name: 'InsertCoupon',
  data() {
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
    var intNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('dwmanager.enterTheUIDInTheCorrectFormat')))
      }
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error(this.$t('dwmanager.enterTheUIDInTheCorrectFormat')))
        } else {
          callback()
        }
      }
    }
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
      digform: {
        batchNo: '',
        businessType: '1',
        currencyCode: '',
        remarks: '',
        bizType: '',
        userId: '',
        giveNumber: '',
        validTime: ''
      },
      rules: {
        currencyCode: [
          { required: true, message: this.$t('common.selectCurrency'), trigger: 'change' }
        ],
        remarks: [
          { required: true, message: this.$t('financemanager.pleaseEnterTheTokenRemarks'), trigger: 'blur' }
        ],
        bizType: [
          { required: true, message: this.$t('financemanager.selectSceneType'), trigger: 'change' }
        ],
        userId: [
          { required: true, validator: intNumber, trigger: 'blur' }
        ],
        giveNumber: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    }
  },
  mounted() {
    this.digform.batchNo = getNowFormatDate()
    this.getCurrency(1)
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 提交
    submit() {
      this.$refs.digform.validate((valid) => {
        if (valid) {
          this.$confirm(this.$t('financemanager.whetherToAddCouponsToGiveAway'), this.$t('common.prompt'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            insert(this.digform).then(res => {
              this.$message({
                type: 'success',
                message: this.$t('common.addSuccess')
              })
              this.$refs.digform.resetFields()
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('financemanager.cancelAdd')
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
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
