<template>
  <div>
    <div :class="$style.serachBox">
      <el-select
        v-model="rateValue"
        filterable
        :placeholder="$t('symbolSort.choiceOfBaseCurrency')"
        clearable
      >
        <el-option
          v-for="item in rateOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <div :class="$style.button">
        <el-button type="primary" @click="searchRate">{{ $t('symbolSort.search') }}</el-button>
      </div>
    </div>
    <div :class="$style.button">
      <el-button type="primary" @click="handleAdd">{{ $t('symbolSort.addCurrencyPair') }}</el-button>
      <el-button type="warning" @click="stetRule">{{ $t('symbolSort.configureAlarmRules') }}</el-button>
    </div>
    <el-table :data="rateTableData" border>
      <el-table-column prop="symbol" align="center" :label="$t('symbolSort.currencyPair')" width="300px" />
      <el-table-column prop="currencyPrice" align="center" :label="$t('symbolSort.realTimeSpotPrice')" width="300px" />
      <el-table-column prop="dayChange" align="center" :label="$t('symbolSort.rate')" width="300px" />
      <el-table-column :label="$t('symbolSort.operate')" align="center" width="300px">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >{{ $t('symbolSort.delete') }}</el-button>
          <el-button type="primary" size="small" @click="handleQuotePush(scope.row)">行情推送</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增币对弹窗 -->
    <el-dialog
      :title="$t('symbolSort.addCurrencyPair')"
      :visible.sync="open1"
      :close-on-click-modal="false"
      width="1000px"
      @close="closed"
    >
      <template>
        <div id="app">
          <tree-transfer
            v-model="model"
            ref="treeTransfer"
            node-key="symbolId"
            default-expand-all
            show-checkbox
            :titles="[$t('symbolSort.allCurrencyPairCodes'), $t('symbolSort.rateCurrencyPairCodes')]"
            :placeholder="[$t('symbolSort.searchCurrencyPairCodes'), $t('symbolSort.searchCurrencyPairCodes')]"
            search
            :selectMax='999'
            showCheckAll
            showCheckNum
            :props="props"
            :data="symbolDataList"
          >
            <!-- 自定义节点内容 -->
            <template #leftText="{ node }">
              <span>{{ node.label }}</span>
            </template>
            <template #rightText="{ node }">
              <span>{{ node.label }}</span>
            </template>
          </tree-transfer>
        </div>
      </template>
      <div :class="$style.footerButton">
        <span slot="footer" class="dialog-footer" >
          <el-button type="primary" @click="handlesure">{{ $t('symbolSort.save') }}</el-button>
        </span>
      </div>
    </el-dialog>
    <!-- 配置涨幅报警规则 -->
    <el-dialog :title="$t('symbolSort.configureAlarmRules')" :visible.sync="setRuleDialogVisible" :before-close="close" :close-on-click-modal="false" width="500px">
      <el-form ref="setRuleForm" :model="setRuleForm" :rules="rules" label-width="120px">
        <el-form-item :label="$t('symbolSort.setTheIncreaseRule')" prop="ruleCount">
          <el-input-number v-model="setRuleForm.ruleCount" :min="1" :max="3" :precision="0" @change="changeRuleNumber" />
          <div :class="$style.tip">{{ $t('symbolSort.rulesLimit') }}</div>
        </el-form-item>
        <div v-if="setRuleForm.ruleCount >= 1">
          <span :class="$style.title">{{ $t('symbolSort.increaseAlarmRuleOne') }}</span>
          <el-form-item :label="$t('symbolSort.outpace')" prop="rule1" :rules="rules.rule">
            <el-input v-model="setRuleForm.rule1" type="text" :placeholder="$t('symbolSort.inputDigit')" @input="setRuleForm.rule1 = setRuleForm.rule1.replace(/[^\d.]/g, '')">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
        </div>
        <div v-if="setRuleForm.ruleCount >= 2">
          <span :class="$style.title">{{ $t('symbolSort.increaseAlarmRuleTwo') }}</span>
          <el-form-item :label="$t('symbolSort.outpace')" prop="rule2" :rules="rules.rule">
            <el-input v-model="setRuleForm.rule2" type="text" :placeholder="$t('symbolSort.inputDigit')" @input="setRuleForm.rule2 = setRuleForm.rule2.replace(/[^\d.]/g, '')">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
        </div>
        <div v-if="setRuleForm.ruleCount >= 3">
          <span :class="$style.title">{{ $t('symbolSort.increaseAlarmRuleThree') }}</span>
          <el-form-item :label="$t('symbolSort.outpace')" prop="rule3" :rules="rules.rule">
            <el-input v-model="setRuleForm.rule3" type="text" :placeholder="$t('symbolSort.inputDigit')" @input="setRuleForm.rule3 = setRuleForm.rule3.replace(/[^\d.]/g, '')">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="close">{{ $t('symbolSort.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('symbolSort.sure') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { TreeTransfer } from "ele-tree-transfer"
import { getSymbolListV4, getConfigSymbols, getBatchSave, deleteRate, getPageList, getIncreasesRuleConfigList, addBatchSave } from '@/api/cmsSymbolSort.js'
export default {
  name: 'Rate',
  components: {
    TreeTransfer,
  },
  data() {
    const checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('symbolSort.enterANumberGreaterThan0')))
      }
      if (String(value).indexOf('.') >= 0 && (String(value).length - (String(value).indexOf('.') + 1)) > 2) {
        return callback(new Error(this.$t('symbolSort.precisionLimite')))
      } else {
        callback()
      }
    }
    return {
      rateValue: '',
      rateOptions: [],
      rateTableData: [],
      open1: false,
      symbolDataList: [],
      props: {
        label: "symbol",
        value: "symbolId",
        children: "children",
        disabled: "disabled",
      },
      model: [],
      setRuleDialogVisible: false,
      setRuleForm: {
        ruleCount: 1,
        rule1: '',
        rule2: '',
        rule3: ''
      },
      // 表单校验
      rules: {
        rule: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRateTableData()
    this.getRateOption()
  },
  methods: {
    getRateOption() {
      getSymbolListV4().then((res) => {
        if (res.code === 200) {
          this.rateOptions = res.data
        }
      })
    },
    searchRate() {
      this.getRateTableData()
    },
    async getRateTableData() {
      const { data } = await getPageList({ id: this.rateValue })
      this.rateTableData = data
    },
    async handleAdd() {
      this.model = []
      const { data } = await getConfigSymbols()
      this.symbolDataList = data
      data.map(item => {
        if (item.id !== null) {
          this.model.push(item.symbolId)
        }
      })
      this.open1 = true
    },
    async stetRule() {
      this.setRuleDialogVisible = true
      const { data } = await getIncreasesRuleConfigList()
      this.setRuleForm.ruleCount = data.ruleCount
      if (data && data.ruleConfig[0]) {
        this.setRuleForm.rule1 = data.ruleConfig[0].rule
      }
      if (data && data.ruleConfig[1]) {
        this.setRuleForm.rule2 = data.ruleConfig[1].rule
      }
      if (data && data.ruleConfig[2]) {
        this.setRuleForm.rule3 = data.ruleConfig[2].rule
      }
      this.changeRuleNumber()
    },
    changeRuleNumber() {
      if (this.setRuleForm.ruleCount === 1) {
        this.setRuleForm.rule2 = ''
        this.setRuleForm.rule3 = ''
      }
      if (this.setRuleForm.ruleCount === 2) {
        this.setRuleForm.rule3 = ''
      }
    },
    closed() {
      this.$refs['treeTransfer'].clearSearch()
      this.$refs['treeTransfer'].clearChecked()
    },
    close() {
      this.setRuleDialogVisible = false
      this.$refs['setRuleForm'].resetFields()
    },
    handleDelete(row) {
      this.$confirm(this.$t('symbolSort.isDeleteCoin'), this.$t('symbolSort.tip'), {
        confirmButtonText: this.$t('symbolSort.sure'),
        cancelButtonText: this.$t('symbolSort.cancel'),
        type: 'warning'
      }).then(() => {
        deleteRate({ id: row.id })
          .then(response => {
            this.$message({
              type: 'success',
              message: this.$t('symbolSort.deleteSuccess')
            })
            this.getRateTableData()
          })
          .catch(error => {
            console.log(error)
          })
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('symbolSort.canceled')
          })
        })
    },
    handleQuotePush(row) {
      this.$router.push({ name: 'addMessageTask', query: { type: 'quickCreationByQuotePush', initData: JSON.stringify(row) }})
    },
    handlesure() {
      const selectedList = []
      this.symbolDataList.map(item => {
        if (this.model.includes(item.symbolId)) {
          selectedList.push(item)
        }
      })
      if (selectedList.length <= 0) {
        return this.msgError(this.$t('symbolSort.limitMinCurrency'))
      }
      getBatchSave(selectedList).then(response => {
        if (response.code === 200) {
          this.msgSuccess(this.$t('symbolSort.saveSuccess'))
          this.getRateTableData()
          this.getRateOption()
          this.open1 = false
        } else {
          this.msgError(this.$t('symbolSort.saveFail'))
        }
      })
    },
    handleSubmit() {
      this.$refs['setRuleForm'].validate((valid) => {
        if (valid) {
          if (this.setRuleForm.ruleCount === undefined) {
            return this.msgError(this.$t('symbolSort.rulesLimit'))
          }
          if (this.setRuleForm.ruleCount === 1) {
            this.params = {
              ruleCount: this.setRuleForm.ruleCount,
              ruleConfig: [
                { rule: this.setRuleForm.rule1 }
              ]
            }
          }
          if (this.setRuleForm.ruleCount === 2) {
            if (this.setRuleForm.rule1 === this.setRuleForm.rule2) {
              return this.msgError(this.$t('symbolSort.setFail'))
            }
            this.params = {
              ruleCount: this.setRuleForm.ruleCount,
              ruleConfig: [
                { rule: this.setRuleForm.rule1 },
                { rule: this.setRuleForm.rule2 }
              ]
            }
          }
          if (this.setRuleForm.ruleCount === 3) {
            if (this.setRuleForm.rule1 === this.setRuleForm.rule2 || this.setRuleForm.rule1 === this.setRuleForm.rule3 || this.setRuleForm.rule2 === this.setRuleForm.rule3) {
              return this.msgError(this.$t('symbolSort.setFail'))
            }
            this.params = {
              ruleCount: this.setRuleForm.ruleCount,
              ruleConfig: [
                { rule: this.setRuleForm.rule1 },
                { rule: this.setRuleForm.rule2 },
                { rule: this.setRuleForm.rule3 }
              ]
            }
          }
          addBatchSave(this.params)
          this.setRuleDialogVisible = false
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.serachBox {
  display: flex;
  margin-bottom: 20px;
}
.button {
  margin-left: 10px;
  margin-bottom: 10px;
}
.tip {
  color: red;
}
.title {
  font-weight: bold;
}
.footerButton {
  text-align: right;
  margin-top: 10px;
}
</style>

