<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<template>
  <div class="user-assets-wraper" style="padding-bottom: 20px">
    <el-form ref="queryForm" :model="form" :inline="true">
      <el-form-item :label="$t('userManager.currency')" prop="symbol">
        <el-select
          v-model="form.names"
          size="mini"
          filterable
          clearable
          :placeholder="$t('userManager.selectCurrency')"
        >
          <el-option value="" :label="$t('userManager.all')" />
          <el-option
            v-for="(item,index) in currencyList"
            :key="index"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label prop="symbol">
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{ $t('userManager.search') }}</el-button>
      </el-form-item>
    </el-form>
    <h3 style="margin-top: -8px;">
      <span>{{ $t('userManager.userAssetsToU') }}{{ userAssetsData.sumBalance }}</span>
      <el-tooltip :content="$t('userManager.userAssetsToUTip')" placement="top">
        <i class="el-icon-warning-outline" />
      </el-tooltip>
    </h3>
    <h5>
      <span>{{ $t('userManager.spotAssetsToU') }} {{ userAssetsData.spotTotalBalance }} ｜</span>
      <span>{{ $t('userManager.pactAssetsToU') }} {{ userAssetsData.contractTotalBalance }} ｜</span>
      <span>{{ $t('userManager.earnAssetsToU') }} {{ userAssetsData.financeTotalBalance }}</span>
    </h5>
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column fixed="left">
        <el-table-column prop="currencyCode" :label="$t('userManager.currency')">
          <template slot-scope="scope">
            <span>{{ scope.row.currencyCode }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <!-- 现货账户 -->
      <el-table-column :label="$t('userManager.soptAccount')">
        <el-table-column prop="spotBalanceUsd" width="200" label-class-name="spot-balance my-table-heeader" label="现货账户余额（折USD）" />

        <el-table-column prop="spotBalance" width="200" label-class-name="spot-balance my-table-heeader" :label="$t('userManager.soptAccountNum')">
          <template slot-scope="scope">
            <span>{{ scope.row.spotBalance }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="spotFrozenBalance" :label="$t('userManager.soptFrozenNum')">
          <el-table-column prop="spotOrderFrozenBalance" width="180" :label="$t('userManager.soptEntrustFrozenNum')" />
          <el-table-column prop="spotWithdrawFrozenBalance" width="180" :label="$t('userManager.spotWithdrawFrozenBalance')" />
          <el-table-column prop="spotTransferFrozenBalance" width="180" :label="$t('userManager.spotTransferFrozenBalance')" />
          <el-table-column prop="spotSystemFrozenBalance" width="180" :label="$t('userManager.spotSystemFrozenBalance')" />
          <!-- no data -->
          <el-table-column prop="launchpadFrozenBalance" width="200" :label="$t('userManager.spotLaunchpadBalance')">
            <div slot="header" @click="$emit('toTab', 'LaunchpadData')">
              {{ $t('userManager.spotLaunchpadBalance') }}
            </div>
          </el-table-column>
          <el-table-column :label="$t('userManager.count')" width="150">
            <template slot-scope="scope">
              <span>{{ totalFrozenBalance(scope.row) }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="spotLockedBalance" width="200" :label="$t('userManager.spotLockedBalance')">
          <template slot-scope="scope">
            <span>{{ scope.row.spotLockedBalance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="spotAvailableBalance" width="200" :label="$t('userManager.spotAvailableBalance')">
          <template slot-scope="scope">
            <span>{{ scope.row.spotAvailableBalance }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <!-- 理财资产 -->
      <el-table-column :label="$t('userManager.earnAccount')">
        <el-table-column prop="totalFinanceBalance" label-class-name="earn-balance my-table-heeader" width="200" :label="$t('userManager.spotEarnBalance')">
          <div slot="header" @click="$emit('toTab', 'EarnData')">
            {{ $t('userManager.spotEarnBalance') }}
          </div>
          <template slot-scope="scope">
            <span>{{ scope.row.totalFinanceBalance }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <!-- 合约账户 -->
      <el-table-column prop="currencyCode" :label="$t('userManager.pactAccount')">
        <el-table-column prop="spotBalance" width="200" :label="$t('userManager.pactAccountEquity')">
          <template slot-scope="scope">
            <span>{{ scope.row.contractAccountEquity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contractAvailableBalance" width="200" :label="$t('userManager.contractAvailableBalance')">
          <template slot-scope="scope">
            <span>{{ scope.row.contractAvailableBalance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contractUnRealizedProfit" width="200" :label="$t('userManager.contractUnRealizedProfit')">
          <div slot="header">
            <el-tooltip class="item" effect="dark" :content="$t('userManager.contractUnRealizedProfitTip')" placement="top-start">
              <span style="border-bottom: 1px dashed #000;">{{ $t('userManager.contractUnRealizedProfit') }}</span>
            </el-tooltip>
          </div>
          <template slot-scope="scope">
            <span>{{ scope.row.contractUnRealizedProfit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contractInitMargin" width="200" :label="$t('userManager.contractInitMargin')">
          <template slot-scope="scope">
            <span>{{ scope.row.contractInitMargin }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contractFrozenInitMargin" width="200" :label="$t('userManager.contractFrozenInitMargin')">
          <template slot-scope="scope">
            <span>{{ scope.row.contractFrozenInitMargin }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contractFrozenInitMargin" width="200" :label="$t('userManager.contractBalance')" label-class-name="pact-balance my-table-heeader">
          <template slot-scope="scope">
            <span>{{ scope.row.contractBalance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contractFrozenInitMargin" width="180" :label="$t('userManager.contractTrialFee')">
          <div slot="header">
            <el-tooltip class="item" effect="dark" :content="$t('userManager.contractTrialFeeTip')" placement="top-start">
              <span style="border-bottom: 1px dashed #000;">{{ $t('userManager.contractTrialFee') }}</span>
            </el-tooltip>
          </div>
          <template slot-scope="scope">
            <span>{{ scope.row.contractBonusBalance }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column :label="$t('userManager.operate')" fixed="right" width="300" align="center">
        <template slot-scope="scope">
          <div>
            <el-button type="danger" size="mini" @click="handleEdit(scope.row, true)">{{ $t('userManager.buttonText1') }}</el-button>
            <div style="height: 10px;margin-left: 20px;" />
            <el-button type="danger" size="mini" @click="handleEdit(scope.row, false)">{{ $t('userManager.buttonText2') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="load"
      />
    </div>
    <el-dialog :title="dialogTitle.title" :visible.sync="visible" :before-close="cancel" width="600px" top="5vh">
      <el-form ref="dialogForm" :model="dialogForm" :rules="dialogFormRules" label-position="left" label-width="auto">
        <el-form-item :label="dialogTitle.symbol" prop="symbol">
          <span>{{ dialogForm.currencyCode }}</span>
        </el-form-item>
        <el-form-item :label="dialogTitle.amount" prop="amount">
          <el-input v-model="dialogForm.amount" clearable :placeholder="dialogTitle.placeholder" style="width: 200px" />
          <el-button @click="dialogForm.amount = dialogFrozen ? dialogForm.spotAvailableBalance : dialogForm.spotSystemFrozenBalance">{{ $t('userManager.all') }}</el-button>
        </el-form-item>
        <el-form-item :label="dialogTitle.remark" prop="remark">
          <el-input v-model="dialogForm.remark" clearable style="width: 200px" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="excute">{{ $t('userManager.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('userManager.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageList, balanceUnfrozen, balanceFrozen } from '@/api/assets'
import { mapState } from 'vuex'
import BigNumber from 'bignumber.js'
export default {
  name: 'UserAssets',
  props: ['msg', 'uid'],
  data() {
    const checkAmount = (rule, value, callback) => {
      if (Number.isNaN(+value) || +value <= 0 || BigNumber(value).dp() > 12) {
        return callback(new Error(this.$t('userManager.errTip')))
      }
      callback()
    }
    return {
      sum: '',
      loading: true,
      tableData: [],
      form: {
        userid: this.msg,
        pageSize: 10,
        pageNum: 1,
        uid: this.uid
      },
      total: 0,
      visible: false,
      dialogFrozen: true, // true：冻结，false：解冻
      dialogForm: {
        userUid: this.uid,
        currencyCode: '',
        amount: '',
        remark: '',
        spotAvailableBalance: '', // 当前币种现货账户可用余额总个数
        spotSystemFrozenBalance: ''// 人工操作冻结资产
      },
      dialogFormRules: {
        amount: [
          { required: true, message: this.$t('userManager.notEmpty'), trigger: 'blur' },
          { validator: checkAmount, trigger: 'blur' }
        ]
      },
      userAssetsData: {
        spotTotalBalance: '--',
        contractTotalBalance: '--',
        financeTotalBalance: '--',
        sumBalance: '--'
      }
    }
  },
  created() {
    this.load()
  },
  // eslint-disable-next-line vue/order-in-components
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    dialogTitle() {
      return {
        title: this.dialogFrozen ? this.$t('userManager.title1') : this.$t('userManager.title2'),
        symbol: this.dialogFrozen ? this.$t('userManager.symbolTip1') : this.$t('userManager.symbolTip2'),
        amount: this.dialogFrozen ? this.$t('userManager.amountTip1') : this.$t('userManager.amountTip2'),
        remark: this.dialogFrozen ? this.$t('userManager.remarkTip1') : this.$t('userManager.remarkTip2'),
        placeholder: this.dialogFrozen
          ? this.$t('userManager.placeholder1', { num: this.dialogForm.spotAvailableBalance })
          : this.$t('userManager.placeholder2', { num: this.dialogForm.spotSystemFrozenBalance })
      }
    }
  },
  methods: {
    cancel() {
      this.visible = false
      this.$refs['dialogForm'].resetFields()
    },
    tableHeaderColor ({  column, rowIndex, columnIndex }) {
      if (rowIndex === 0 && columnIndex === 0) {
        return { background: '#496aff' }
      }
      if (rowIndex === 0 && columnIndex === 1) {
        return { background: '#f6a04d', color: '#fff' }
      }
      if (rowIndex === 0 && columnIndex === 2) {
        return { background: '#e3491a', color: '#fff' }
      }
      if (rowIndex === 0 && columnIndex === 3) {
        return { background: '#00bc7b', color: '#fff' }
      }
      if (rowIndex === 0 && columnIndex === 4) {
        return { background: '#0087bc' }
      }
    },
    excute() {
      if (this.dialogFrozen) {
        balanceFrozen(this.dialogForm).then(res => {
          this.$message.success(this.$t('userManager.excuteOK'))
          this.cancel()
          this.load()
        }).catch(rej => {
          this.$message.error(this.$t('userManager.excuteError'))
        })
      } else {
        balanceUnfrozen(this.dialogForm).then(res => {
          this.$message.success(this.$t('userManager.excuteOK'))
          this.cancel()
          this.load()
        }).catch(rej => {
          this.$message.error(this.$t('userManager.excuteError'))
        })
      }
    },
    totalBalance(a, b) {
      return BigNumber(a).minus(b).toFixed()
    },
    totalFrozenBalance(row) {
      return BigNumber(row.spotOrderFrozenBalance)
        .plus(row.spotWithdrawFrozenBalance)
        .plus(row.spotTransferFrozenBalance)
        .plus(row.launchpadFrozenBalance)
        .plus(row.spotSystemFrozenBalance).toFixed()
    },
    handleEdit(row, type) {
      this.dialogFrozen = type
      this.dialogForm.currencyCode = row.currencyCode
      this.dialogForm.spotAvailableBalance = row.spotAvailableBalance
      this.dialogForm.spotSystemFrozenBalance = row.spotSystemFrozenBalance
      this.visible = true
    },
    load() {
      this.loading = true
      this.form.symbol === this.$t('userManager.all') || this.form.symbol === '全部' ? '' : this.form.symbol
      pageList(this.form)
        .then(response => {
          if (response.code === 200) {
            this.tableData = response.rows
            this.userAssetsData = {
              ...response.data,
              sumBalance: BigNumber(response.data.sumBalance).plus(response.data.financeTotalBalance)
            }
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.sum = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>
 <!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.user-assets-wraper {
  ::v-deep .spot-balance {
    background: #e84545;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
  ::v-deep .pact-balance {
    background: #62d2a2;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
  ::v-deep .earn-balance {
    background: #ff9a00;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
}
</style>

