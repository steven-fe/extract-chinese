<template>
  <div class="tableContent">
    <el-form
      ref="digform"
      :label-position="labelPosition"
      label-width="80px"
      :model="form"
      :rules="rules"
    >
      <el-form-item :label="$t('financemanager.businessType')" prop="optionsAccountChildValue">
        <el-select
          v-model="optionsAccountChildValue"
          :placeholder="$t('financemanager.pleaseSelectABusinessType')"
          clearable
        >
          <el-option
            v-for="item in optionsAccountChild"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <div class="qishi">
        <el-form-item :label="$t('financemanager.startingAccountType')" prop="optionsAccountBeginTypeValue">
          <el-select
            v-model="optionsAccountBeginTypeValue"
            :placeholder="$t('financemanager.pleaseSelectAStartAccountType')"
          >
            <el-option
              v-for="item in optionsAccountBeginType"
              :key="item.accountType"
              :label="item.name"
              :value="item.accountType"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('financemanager.initialAccount')" prop="optionsAccountBeginValue">
          <el-select
            v-model="optionsAccountBeginValue"
            :placeholder="$t('financemanager.pleaseSelectAStartAccount')"
          >
            <el-option
              v-for="item in optionsAccountBegin"
              :key="item.id"
              :label="item.accountName"
              :value="item.uid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="uid" prop="Quid">
          <el-input
            v-model="form.Quid"
            :disabled="
              !(
                optionsAccountBegin.length &&
                optionsAccountBegin[0].uid === 'common'
              )
            "
            :placeholder="$t('financemanager.pleaseEnterUid')"
          />
        </el-form-item>
        <el-form-item :label="$t('common.coin')" prop="coin">
          <el-select v-model="form.coin" filterable :placeholder="$t('common.selectCurrency')">
            <el-option
              v-for="item in currencyList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <div class="searchBox">
          <el-button
            type="primary"
            @click="getUserBanlance"
          >{{ $t('financemanager.queryAvailableBalance') }}</el-button>
          <el-input v-model="banlance" disabled />
        </div>
      </div>
      <div class="target">
        <el-form-item :label="$t('financemanager.targetAccountType')" prop="optionsAccountTargetTypeValue">
          <el-select
            v-model="optionsAccountTargetTypeValue"
            placeholder=""
            disabled
          >
            <el-option
              v-for="item in optionsAccountTargetType"
              :key="item.id"
              :label="item.name"
              :value="item.accountType"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('financemanager.targetAccount')" prop="optionsAccountTargetValue">
          <el-select
            v-model="optionsAccountTargetValue"
            :placeholder="$t('financemanager.pleaseSelectTheTargetAccount')"
          >
            <el-option
              v-for="item in optionsAccountTarget"
              :key="item.uid"
              :label="item.accountName"
              :value="item.uid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="uid" prop="uidTarget">
          <el-input
            v-model="form.uidTarget"
            :disabled="
              !(
                optionsAccountTarget.length &&
                optionsAccountTarget[0].uid === 'common'
              )
            "
            :placeholder="$t('financemanager.pleaseEnterUid')"
          />
        </el-form-item>
        <el-form-item :label="$t('financemanager.quantity')" prop="count">
          <el-input v-model.trim="form.count" />
        </el-form-item>
      </div>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">{{ $t('financemanager.submit') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  getChildList,
  getSelectList,
  newTransfer,
  getUserBalanceNew
} from '@/api/finance/transfer'
import { getCurrencyList } from '@/api/systemsetting/common'

export default {
  data() {
    return {
      labelPosition: 'top',
      currencyList: [],
      options: [],
      beginType: [],
      targetType: [],
      optionsAccountChild: [], // 子业务类型下拉
      optionsAccountChildValue: '', // 子业务类型选中的值
      optionsAccountBeginTypeValue: '', // 起始账户类型值
      optionsAccountBeginType: [], // 起始账户类型
      optionsAccountBeginValue: '', // 起始账户值
      optionsAccountBegin: [], // 起始账户
      optionsAccountTargetType: [], // 目标账户类型下拉
      optionsAccountTargetTypeValue: '',
      optionsAccountTarget: [], // 目标账户下拉
      optionsAccountTargetValue: '', // 目标账户当前选中的值
      banlance: '',
      form: {
        name: '',
        Quid: '',
        coin: '',
        uidTarget: '',
        count: '',
        optionsAccountChildValue: '',
        optionsAccountBeginTypeValue: '',
        optionsAccountBeginValue: '',
        optionsAccountTargetTypeValue: '',
        optionsAccountTargetValue: ''
      },
      rules: {
        optionsAccountChildValue: [
          {
            required: true,
            message: this.$t('financemanager.pleaseSelectASubBusinessType'),
            trigger: 'change'
          }
        ],
        optionsAccountBeginTypeValue: [
          {
            required: true,
            message: this.$t('financemanager.startAccountTypeCannotBeEmpty'),
            trigger: 'change'
          }
        ],
        optionsAccountBeginValue: [
          {
            required: true,
            message: this.$t('financemanager.pleaseSelectAStartAccount'),
            trigger: 'change'
          }
        ],
        optionsAccountTargetTypeValue: [
          {
            required: true,
            message: this.$t('financemanager.targetAccountTypeCannotBeEmpty'),
            trigger: 'change'
          }
        ],
        optionsAccountTargetValue: [
          {
            required: true,
            message: this.$t('financemanager.targetAccountCannotBeEmpty'),
            trigger: 'change'
          }
        ],
        Quid: [
          {
            required: true,
            message: this.$t('financemanager.uidCannotBeEmpty'),
            trigger: 'change'
          },
          { pattern: /^[1-9]\d*$/, message: this.$t('financemanager.parameterError'), trigger: 'blur' }
        ],
        uidTarget: [
          {
            required: true,
            message: this.$t('financemanager.uidCannotBeEmpty'),
            trigger: 'change'
          },
          { pattern: /^[1-9]\d*$/, message: this.$t('financemanager.parameterError'), trigger: 'blur' }
        ],
        coin: [
          {
            required: true,
            message: this.$t('common.selectCurrency'),
            trigger: 'change'
          }
        ],
        count: [
          {
            required: true,
            message: this.$t('financemanager.quantityCannotBeEmpty'),
            trigger: 'blur'
          },
          { pattern: /^\d+(\.\d+)?$/, message: this.$t('financemanager.parameterError'), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    typeList() {
      return {
        '0': '普通账户',
        '1': this.$t('financemanager.financialAccount'),
        '2': this.$t('financemanager.businessAccount')
      }
    }
  },

  watch: {
    optionsAccountChildValue(val, old) {
      this.optionsAccountBeginTypeValue = ''
      this.optionsAccountTargetTypeValue = ''
      this.form.optionsAccountChildValue = val
      this.banlance = ''
      const findVal = this.optionsAccountChild.find((item) => item.id === val)
      const arr = findVal
        ? findVal.outType.split(',').map((item) => {
          return {
            accountType: item,
            name:
                item === '2'
                  ? this.$t('financemanager.businessAccount')
                  : item === '0'
                    ? '普通账户'
                    : this.$t('financemanager.financialAccount')
          }
        })
        : []
      this.optionsAccountBeginType = arr
      this.beginType = arr

      const arr1 = findVal
        ? findVal.inType.split(',').map((item) => {
          return {
            accountType: item,
            name:
                item === '2'
                  ? this.$t('financemanager.businessAccount')
                  : item === '0'
                    ? '普通账户'
                    : this.$t('financemanager.financialAccount')
          }
        })
        : []
      this.optionsAccountTargetType = arr1
      this.targetType = arr1
      if (this.beginType.length === 1) {
        this.optionsAccountTargetTypeValue = this.optionsAccountTargetType[0].accountType
        this.optionsAccountBeginTypeValue = this.beginType[0].accountType
      }
    },

    optionsAccountBeginTypeValue(val) {
      this.optionsAccountBeginValue = ''

      this.form.optionsAccountBeginTypeValue = val
      this.optionsAccountBegin = []
      this.form.Quid = ''
      if (val) {
        getSelectList({ accountType: val }).then((res) => {
          if (res.code === 200) {
            this.optionsAccountBegin = res.data
            if (!res.data.length) {
              this.optionsAccountBegin = [
                { uid: 'common', accountName: '普通账户' }
              ]
              this.optionsAccountBeginValue = 'common'
            }
          } else {
            this.optionsAccountBegin = []
          }
        })
      }

      if (val && this.beginType.length > 1) {
        this.optionsAccountTargetType = this.beginType.filter(
          (item) => item.accountType !== val
        )
        this.optionsAccountTargetTypeValue = this.optionsAccountTargetType[0].accountType
      }
    },
    optionsAccountBeginValue(val) {
      this.form.Quid = val === 'common' ? '' : val
      this.form.optionsAccountBeginValue = val
    },
    optionsAccountTargetValue(val) {
      this.form.uidTarget = val === 'common' ? '' : val
      this.form.optionsAccountTargetValue = val
    },

    optionsAccountTargetTypeValue(val) {
      this.optionsAccountTargetValue = ''
      this.form.optionsAccountTargetTypeValue = val
      this.optionsAccountTarget = []
      if (val) {
        getSelectList({ accountType: val }).then((res) => {
          if (res.code === 200) {
            this.optionsAccountTarget = res.data
            if (!res.data.length) {
              this.optionsAccountTarget = [
                { uid: 'common', accountName: '普通账户' }
              ]
              this.optionsAccountTargetValue = 'common'
            }
          } else {
            this.optionsAccountTarget = []
          }
        })
      }
      // if (val && this.targetType.length > 1) {
      //   this.optionsAccountBeginType = this.targetType.filter(
      //     (item) => item.accountType !== val
      //   );
      // }
    }
  },
  created() {
    this.getCurrencyListInfo()
    this.getChildListInfo()
  },
  methods: {
    onSubmit() {
      this.$refs.digform.validate((valid) => {
        if (valid) {
          if (valid) {
            const coinName = this.currencyList.find((el) => el.id === this.form.coin).name

            this.$confirm(
              `${this.$t('common.rollOutUID')} ${this.form.Quid}&nbsp;&nbsp;&nbsp;${this.$t('common.balanceAccount')}<br/>
                ${this.$t('common.shiftToUID')} ${this.form.uidTarget}&nbsp;&nbsp;&nbsp;${this.$t('common.balanceAccount')}<br/>
                ${this.$t('common.currencyName')}${coinName}<br/>
                ${this.$t('common.transferOutAmount')}${this.form.count} ${coinName}<br/>
                ${this.$t('common.amountAvailableForStartingAccount')}${this.banlance} ${coinName}<br/>`
              ,
              this.$t('common.prompt'),
              {
                dangerouslyUseHTMLString: true,
                confirmButtonText: this.$t('common.sure'),
                cancelButtonText: this.$t('common.cancel'),
                type: 'warning'
              }
            )
              .then(() => {
                if (typeof this.banlance !== 'string' || !this.banlance.length || +this.banlance < +this.form.count) return this.$message({ type: 'error', message: '起始账户可用金额不足' })

                const data = {
                  fromUserId: this.form.Quid, // 起使账户id
                  toUserId: this.form.uidTarget, // 目标账户id
                  fromAccountType: this.optionsAccountBeginTypeValue, // 起使账户类型
                  toAccountType: this.optionsAccountTargetTypeValue, // 目标账户类型
                  currencyId: this.form.coin, // 币种id
                  volume: this.form.count, // 数量
                  businessTypeId: this.optionsAccountChildValue, // 业务类型id
                  businessTypePid: this.optionsAccountChild.find(item => item.id === this.optionsAccountChildValue).pid// 所属业务类型id
                }
                newTransfer(data).then((res) => {
                  this.$message({
                    type: 'success',
                    message: this.$t('financemanager.successfulTransfer')
                  })
                  this.resetInfo()
                  this.$refs.digform.resetFields()
                })
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: this.$t('financemanager.transferHasBeenCancelled')
                })
              })
          } else {
            console.log('error submit!!')
            return false
          }
        }
      })
    },
    getCurrencyListInfo() {
      getCurrencyList().then(res => {
        if (res.code === 200) {
          this.currencyList = res.data
        }
      })
    },
    getChildListInfo() {
      getChildList().then((res) => {
        if (res.code === 200) {
          this.optionsAccountChild = res.data
        }
      })
    },
    getUserBanlance() {
      const data = {
        currencyId: this.form.coin,
        userId: this.form.Quid
      }
      getUserBalanceNew(data)
        .then((res) => {
          if (res.code === 200) {
            this.banlance = res.data.spotAvailableBalance
          } else {
            this.$message.error('查询失败')
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    resetInfo() {
      this.optionsAccountChildValue = '',
      this.banlance = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.tableContent {
  padding: 20px;
  ::v-deep .el-input {
    width: 200px;
  }
  .qishi,
  .target {
    display: flex;
    ::v-deep .el-form-item {
      &:not(:nth-child(1)) {
        margin-left: 20px;
      }
    }
  }
  .searchBox {
    display: flex;
    align-items: flex-end;
    padding-bottom: 22px;
    margin-left: 20px;

    ::v-deep .el-input {
      margin-left: 20px;
    }
  }
}
</style>
