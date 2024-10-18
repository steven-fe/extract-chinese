<template>
  <div class="app-container">
    <el-form
      ref="digform"
      :model="digform"
      :rules="rules"
      class="form-grid"
    >
      <el-form-item class="grid-item" :label="$t('financemanager.targetAccountType')" prop="type">
        <el-select v-model="digform.type" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option value="1" :label="$t('financemanager.liquidityAccount')" />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.targetAccount')" prop="userId">
        <el-select v-model="digform.userId" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in accountOptions"
            :key="item.userId"
            :label="item.name + '--UID: ' + item.userId"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('common.coin')" prop="currencyId">
        <el-select v-model="digform.currencyId" style="width: 100%" :placeholder="$t('common.selectCurrency')">
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
      <el-form-item>
        <el-button type="primary" @click="submit">{{ $t('common.sure') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { liquidity, liquidityUser } from '@/api/finance/freecurrency'

export default {
  name: 'Mobility',
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
    return {
      accountOptions: [],
      digform: {
        type: '',
        userId: '',
        currencyId: '',
        volume: ''
      },
      rules: {
        type: [
          { required: true, message: this.$t('financemanager.pleaseSelectTheTargetAccountType'), trigger: 'change' }
        ],
        userId: [
          { required: true, message: this.$t('financemanager.pleaseSelectTheTargetAccount'), trigger: 'change' }
        ],
        currencyId: [
          { required: true, message: this.$t('financemanager.pleaseSelectAChainCurrency'), trigger: 'change' }
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
    this.getCurrency(1)
    liquidityUser().then(res => {
      if (res.code === 200) {
        this.accountOptions = res.data
      }
    })
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    submit() {
      this.$refs['digform'].validate((valid) => {
        if (valid) {
          this.$confirm(this.$t('financemanager.whetherToTransferToTheAccount'), this.$t('common.prompt'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            liquidity(this.digform).then(res => {
              if (res.code === 200) {
                this.$message({
                  type: 'success',
                  message: this.$t('financemanager.successfulTransfer')
                })
                this.$refs.digform.resetFields()
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('financemanager.transferHasBeenCancelled')
            })
          })
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
