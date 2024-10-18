<template>
  <div class="app-container">
    <el-form
      ref="digform"
      :model="digform"
      :rules="rules"
      class="form-grid"
    >
      <el-form-item class="grid-item" :label="$t('financemanager.businessType')" prop="code">
        <div style="padding-left: 10px;width: 100%;float: left">{{ $t('financemanager.giftTransfer') }}</div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.giftBatchNumber')" prop="code">
        <div style="padding-left: 10px;width: 100%;float: left">{{ digform.batchNumber }}</div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.businessScenario')" prop="sceneType">
        <el-select v-model="digform.sceneType" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.targetAccountType')" prop="code">
        <div style="padding-left: 10px;width: 100%;float: left">{{ $t('financemanager.coinAccount') }}</div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.noteOfGift')" prop="remark">
        <el-input v-model.trim="digform.remark" :placeholder="$t('financemanager.pleaseEnterRemarks')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.currencyCode')" prop="currencyId">
        <el-select v-model="digform.currencyId" style="width: 100%" filterable :placeholder="$t('financemanager.currencyCode1')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.number')" prop="volume">
        <el-input v-model.trim="digform.volume" :placeholder="$t('financemanager.pleaseEnterANumberGreaterThan0')" clearable />
      </el-form-item>
      <el-form-item class="grid-item" label="Uid:" prop="uid">
        <el-input v-model="digform.uid" :placeholder="$t('financemanager.pleaseEnterUserUID')" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">{{ $t('common.sure') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { freeAdd } from '@/api/finance/freecurrency'
import { getNowFormatDate } from '@/utils'
export default {
  name: 'Freecurrencytools',
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
      typeOptions: [
        { label: this.$t('common.signUp'), value: 0 },
        { label: this.$t('financemanager.realNameRegistration'), value: 1 },
        { label: this.$t('financemanager.invite'), value: 2 },
        { label: this.$t('financemanager.marketMaking'), value: 3 },
        { label: this.$t('financemanager.other'), value: 4 }
      ],
      digform: {
        batchNumber: '',
        businessType: '1',
        currencyId: '',
        remark: '',
        sceneType: '',
        uid: '',
        volume: ''
      },
      rules: {
        currencyId: [
          { required: true, message: this.$t('common.selectCurrency'), trigger: 'change' }
        ],
        remark: [
          { required: true, message: this.$t('financemanager.pleaseEnterTheTokenRemarks'), trigger: 'blur' }
        ],
        sceneType: [
          { required: true, message: this.$t('financemanager.selectSceneType'), trigger: 'change' }
        ],
        uid: [
          { required: true, validator: intNumber, trigger: 'blur' }
        ],
        volume: [
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
    this.digform.batchNumber = getNowFormatDate()
    this.getCurrency(1)
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 提交
    submit() {
      this.$refs.digform.validate((valid) => {
        if (valid) {
          this.$confirm(this.$t('financemanager.whetherToAddBonus'), this.$t('common.prompt'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            freeAdd(this.digform).then(res => {
              this.$message({
                type: 'success',
                message: this.$t('common.addSuccess')
              })
              this.$refs.digform.resetFields()
              this.digform.batchNumber = getNowFormatDate()
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
