<template>
  <div class="app-container">
    <el-form
      ref="digform"
      :model="digform"
      :rules="rules"
      class="form-grid"
      label-width="150px"
    >
      <el-form-item class="grid-item" :label="$t('financemanager.batchNo')" prop="batchNo">
        <div style="padding-left: 10px;width: 100%;float: left">{{ digform.batchNo }}</div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.contractType')" prop="contractType">
        <el-select v-model="digform.contractType" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.experienceGoldConfigurationVariety')" prop="configKey" label-width="280px">
        <el-select v-model="digform.configKey" style="width: 100%" :placeholder="$t('common.pleaseChoose')" filterable>
          <el-option
            v-for="item in configKeyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.describe')" prop="describe">
        <el-input v-model.trim="digform.describe" :placeholder="$t('financemanager.describe1')" clearable />
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.amountOfSheets')" prop="zhangNumber">
        <el-input v-model.trim="digform.zhangNumber" :placeholder="$t('financemanager.amountOfSheets1')" clearable />
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('common.startTime')" prop="startTime">
        <div style="float: left; width: 100%;">
          <el-date-picker
            v-model="digform.startTime"
            type="datetime"
            :placeholder="$t('financemanager.selectDateAndTime')"
            align="right"
            value-format="timestamp"
            :picker-options="pickerOptions"
          />
        </div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.validUntil')" prop="endTime">
        <div style="float: left; width: 100%;">
          <el-date-picker
            v-model="digform.endTime"
            type="datetime"
            :placeholder="$t('financemanager.selectDateAndTime')"
            align="right"
            value-format="timestamp"
            :picker-options="pickerOptions"
          />
        </div>
      </el-form-item>
      <el-form-item class="grid-item" :label="$t('financemanager.userUID')" prop="uids">
        <el-input v-model.trim="digform.uids" :placeholder="$t('financemanager.enterUserUidSeparatedByCommas')" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">{{ $t('financemanager.grant') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { getConfigKey, grant } from '@/api/operate/bonus'
import { getNowFormatDate } from '@/utils'
export default {
  name: 'Grant',
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
      configKeyOptions: [],
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      typeOptions: [
        { label: this.$t('common.forward'), value: 1 }
      ],
      digform: {
        contractType: '',
        configKey: '',
        describe: '',
        zhangNumber: '',
        startTime: '',
        endTime: '',
        uids: '',
        batchNo: ''
      },
      rules: {
        contractType: [
          { required: true, message: this.$t('financemanager.selectAContractType'), trigger: 'change' }
        ],
        configKey: [
          { required: true, message: this.$t('financemanager.selectConfiguration'), trigger: 'blur' }
        ],
        describe: [
          { required: true, message: this.$t('financemanager.describe1'), trigger: 'change' }
        ],
        zhangNumber: [
          { required: true, message: this.$t('financemanager.amountOfSheets1'), trigger: 'blur' }
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
    this.getConfigKey()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 获取配置信息
    getConfigKey() {
      this.loading = true
      getConfigKey(this.queryParams)
        .then((response) => {
          if (response.code == 200) {
            response.data.forEach(item => {
              const obj = {
                label: item.fKey,
                value: item.fkey
              }
              this.configKeyOptions.push(obj)
            })
            this.loading = false
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 提交
    submit() {
      this.$refs.digform.validate((valid) => {
        if (valid) {
          this.$confirm(this.$t('financemanager.whetherToIssueTheExperienceFee'), this.$t('common.prompt'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            grant(this.digform).then(res => {
              this.$message({
                type: 'success',
                message: this.$t('financemanager.releaseSuccess')
              })
              this.$refs.digform.resetFields()
              this.digform.batchNo = getNowFormatDate()
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('financemanager.cancelledIssue')
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
