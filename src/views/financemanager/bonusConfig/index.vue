<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="120px">
      <el-form-item :label="$t('common.name')" :placeholder="$t('common.name')">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.contractType')" prop="contractType">
        <el-select v-model="form.contractType" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in contractTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addActivity">{{ $t('common.newAdd') }}</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" :label="$t('common.orderNumber')" align="center" min-width="130px" />
      <el-table-column prop="key" label="key" align="center" />
      <el-table-column :label="$t('financemanager.experienceGoldType')" align="center">
        <template slot-scope="scope">
          <el-tooltip v-if="scope.row.type == 7" class="item" effect="light" placement="top">
            <div slot="content">
              {{ $t('financemanager.amountOfStopLossAllocation', {lossAmount: scope.row.lossAmount}) }}
              <br>
              <br>
              {{ $t('financemanager.allocationRatio', {allocationProportion: scope.row.allocationProportion}) }}
            </div>
            <sapn style="color:black;text-decoration: underline;cursor: pointer">
              {{ typeLabel(fTypeOptions, scope.row.type) }}
            </sapn>
          </el-tooltip>
          <span v-else>
            {{ typeLabel(fTypeOptions, scope.row.type) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="name" :label="$t('common.name')" align="center" />
      <el-table-column prop="currency" :label="$t('common.coin')" align="center" />
      <el-table-column prop="symbolName" :label="$t('financemanager.coinPairType')" align="center" />
      <el-table-column prop="amount" :label="$t('common.amount')" align="center" />
      <el-table-column prop="marginRate" :label="$t('financemanager.maximumLever')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.type == 7">{{ scope.row.marginRate }}</span>
          <span v-else>{{ (1 / scope.row.marginRate).toFixed(1) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="updateId ? $t('common.modify') : $t('common.newAdd')" :visible.sync="open" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >

        <el-form-item class="grid-item" label="key:" prop="key">
          <div v-if="updateId ===''">
            <el-input v-model="digform.key" :placeholder="$t('financemanager.pleaseEnterKey')" clearable />
          </div>
          <div v-else>
            <el-input v-model="digform.fKey" disabled="disabled" clearable />
          </div>
        </el-form-item>

        <el-form-item class="grid-item" :label="$t('common.name')" prop="name">
          <div v-if="updateId ===''">
            <el-input v-model="digform.name" :placeholder="$t('financemanager.pleaseEnterTheActivityName')" clearable />
          </div>
          <div v-else>
            <el-input v-model="digform.fName" disabled="disabled" clearable />
          </div>
        </el-form-item>

        <el-form-item class="grid-item" :label="$t('financemanager.experienceGoldType')" prop="type">
          <el-select v-model="digform.type" style="width: 100%" :placeholder="$t('common.pleaseChoose')" @change="typeChange">
            <el-option
              v-for="item in fTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="grid-item" :label="$t('financemanager.contractType')" prop="contractType">
          <el-select v-model="digform.contractType" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in contractTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="grid-item" :label="$t('financemanager.nameOfCurrency')" prop="currencyId">
          <div v-if="updateId ===''">
            <el-select v-model="digform.currencyId" style="width: 100%" :placeholder="$t('common.pleaseChoose')" :disabled="updateId ? true : false">
              <el-option
                v-for="item in currencyOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
          <div v-else>
            <el-input v-model="digform.fCurrencyId" disabled="disabled" clearable />
          </div>
        </el-form-item>

        <el-form-item class="grid-item" :label="$t('systemsetting.text90')" prop="symbolId">
          <el-select v-model="digform.symbolId" style="width: 100%" :placeholder="$t('common.pleaseChoose')" @change="getSymbolLeverage">
            <el-option
              v-for="item in symbolOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('common.amount')" prop="amount">
          <div v-if="updateId ===''">
            <el-input v-model="digform.amount" :placeholder="$t('financemanager.pleaseEnterTheAmount')" clearable />
          </div>
          <div v-else>
            <el-input v-model="digform.fAmount" disabled="disabled" clearable />
          </div>
        </el-form-item>

        <el-form-item class="grid-item" :label="$t('financemanager.maximumLever')" prop="marginRate">
          <span style="float: right; font-size: 12px">{{ $t('financemanager.currencyLeverageUpperLimit') }}:{{ marginRate || '- -' }} x</span>
          <div v-if="updateId ===''">
            <el-input v-model="digform.marginRate" :placeholder="$t('financemanager.pleaseEnterTheMaximumLever')" clearable />
          </div>
          <div v-else>
            <el-input v-model="digform.fMarginRate" disabled="disabled" clearable />
          </div>
        </el-form-item>
        <el-form-item v-if="digform.type == 7" class="grid-item" :label="$t('financemanager.stopLossAmount')" prop="lossAmount">
          <el-input v-model="digform.lossAmount" :placeholder="$t('financemanager.pleaseEnterTheAmount')" clearable />
        </el-form-item>
        <el-form-item v-if="digform.type == 7" class="grid-item" :label="$t('financemanager.allocationRatioAllocationAmount')" prop="allocationProportion">
          <el-input v-model="digform.allocationProportion" :placeholder="$t('financemanager.pleaseEnterAValueBetween0And10')" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">{{ $t('common.preserve') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { pageList, getSymbol, getSymbolLeverage } from '@/api/operate/bonus'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapActions, mapState } from 'vuex'
import * as API from '@/api/operate/bonus'

export default {
  name: 'BonusConfigList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    const checkNumber1 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('financemanager.theMaximumLeverCannotBeEmpty')))
      }
      if (value && this.digform.type == 7) {
        if (!this.digform.symbolId) {
          return callback(new Error(this.$t('financemanager.selectACurrencyPair')))
        }
        if (!this.digform.allocationProportion) {
          return callback(new Error(this.$t('financemanager.theAllocationRatioCannotBeEmpty')))
        }
        // console.log('对比', value, this.marginRate, +this.digform.allocationProportion + 1, this.marginRate/(+this.digform.allocationProportion + 1))
        if (this.digform.symbolId && this.marginRate && value > this.marginRate / (+this.digform.allocationProportion + 1)) {
          return callback(new Error(this.$t('financemanager.maximumLeverageLimit')))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const checkNumber2 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('financemanager.allocationStopLossAmountCannotBeEmpty')))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectNumber')))
        } else {
          if (+value > +this.digform.amount) {
            return callback(new Error(this.$t('financemanager.amountOfStopLossRequired')))
          } else {
            callback()
          }
        }
      }
    }
    const checkNumber3 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('financemanager.allocationStopLossAmountCannotBeEmpty')))
      }
      var reg = /^[1-9]\d*$/
      if (value) {
        if (!reg.test(value) || Number(value) < 1 || Number(value) > 10) {
          return callback(new Error(this.$t('financemanager.pleaseEnterAValueBetween1And10')))
        } else {
          this.$refs.digform.validateField('marginRate')
          callback()
        }
      }
    }
    return {
      symbolOptions: [],
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      contractTypeOptions: [
        { label: this.$t('common.forward'), value: 1 }
      ],
      fTypeOptions: [
        { label: this.$t('financemanager.accountOpeningGift'), value: 1 },
        { label: this.$t('financemanager.backstageInvitation'), value: 2 },
        { label: this.$t('financemanager.generalExperienceFee'), value: 3 },
        { label: this.$t('financemanager.shortTermExperienceFee'), value: 4 },
        { label: this.$t('financemanager.allocationOfExperienceFunds'), value: 7 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        name: '',
        contractType: '',
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      open: false,
      marginRate: '', // 币对最大杠杆
      digform: {
        type: '',
        name: '',
        key: '',
        currencyId: '',
        amount: '',
        marginRate: '',
        symbolId: '',
        contractType: '',
        lossAmount: '',
        allocationProportion: ''
      },
      rules: {
        type: [
          { required: true, trigger: 'blur', message: this.$t('financemanager.theContractTypeCannotBeEmpty') }
        ],
        name: [
          { required: true, trigger: 'blur', message: this.$t('financemanager.theNameCannotBeEmpty') }
        ],
        key: [
          { required: true, trigger: 'blur', message: this.$t('financemanager.theConfigurationKeyCannotBeEmpty') }
        ],
        currencyId: [
          { required: true, message: this.$t('common.selectCurrency'), trigger: 'change' }
        ],
        amount: [
          { required: true, trigger: 'blur', message: this.$t('financemanager.amountCannotBeEmpty') }
        ],
        marginRate: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        symbolId: [
          { required: true, trigger: 'blur', message: this.$t('financemanager.currencyPairCannotBeEmpty') }
        ],
        contractType: [
          { required: true, trigger: 'blur', message: this.$t('financemanager.theContractTypeCannotBeEmpty') }
        ],
        lossAmount: [
          { required: true, validator: checkNumber2, trigger: 'blur' }
        ],
        allocationProportion: [
          { required: true, validator: checkNumber3, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },

  mounted() {
    this.getConfigList()
    this.getSymbol()
  },
  methods: {
    typeChange() {
      if (this.digform.type != 7) {
        this.digform.lossAmount = undefined
        this.digform.allocationProportion = undefined
      }
    },
    getSymbolLeverage(id) {
      getSymbolLeverage({ symbolId: id }).then(res => {
        this.marginRate = res.data
      }).catch(error => {
        this.marginRate = ''
      })
    },
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 日期改变事件
    timeChange(val) {
      if (val) {
        this.form.startTime = val[0]
        this.form.endTime = val[0]
        return
      }
      this.form.startTime = ''
      this.form.endTime = ''
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      pageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.updateId == '') {
            API.insert(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess(this.$t('common.addSuccess'))
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            // API.update(this.digform).then(response => {
            //   if (response.code == 200) {
            //     this.msgSuccess(this.$t('common.modifySuccess'));
            //     this.getConfigList();
            //     this.cancel()
            //   } else {
            //     this.msgError(response.msg);
            //   }
            // });
          }
        }
      })
    },

    // 获取币对信息
    getSymbol() {
      this.loading = true
      getSymbol(this.queryParams)
        .then((response) => {
          if (response.code == 200) {
            response.data.forEach(item => {
              const obj = {
                label: item.symbol,
                value: item.symbolId
              }
              this.symbolOptions.push(obj)
            })
            this.loading = false
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    /** 新增按钮操作 */
    addActivity() {
      this.open = true
      this.title = this.$t('financemanager.addActivityInformation')
      this.updateId = ''
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

</style>
