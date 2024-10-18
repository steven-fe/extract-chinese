<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="120px">
      <el-form-item :label="$t('financemanager.accountType')" prop="type">
        <el-select v-model="form.type" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.acountuid')" prop="userId">
        <el-select v-model="form.userId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in selectArr"
            :key="item.value"
            :label="item.label"
            :value="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currencyId">
        <el-select v-model="form.currencyId" style="width: 100%" filterable clearable size="small" :placeholder="$t('common.all')">
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportData">{{ $t('common.derive') }}</el-button>
      </el-form-item>
    </el-form>
    UID:{{ formTitle.userId }}
    &nbsp;&nbsp;{{ $t('financemanager.cashAssetsAreDiscountedU') }}: {{ formTitle.spotToUsdt }}
    &nbsp;&nbsp;{{ $t('financemanager.contractAssetsAreFoldedU') }}: {{ formTitle.contractToUsdt }}
    &nbsp;&nbsp;{{ $t('financemanager.totalAssetsFoldU') }}:{{ formTitle.totalUsdBalance }}
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.coin')" align="center">
        <template slot-scope="scope">{{ scope.row.currency }}</template>
      </el-table-column>

      <el-table-column :label="$t('usermanage.text58')" align="center">
        <template slot-scope="scope">{{ scope.row.spotBalance }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.spotDiscountUBalance')" align="center">
        <template slot-scope="scope" type="form">{{ scope.row.spotToUsdt }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.contractAccountBalance')" align="center">
        <template slot-scope="scope">{{ scope.row.contractBalance }}</template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.contractToUBalance')" align="center">
        <template slot-scope="scope" type="form">{{ scope.row.contractToUsdt }}</template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
  </div>
</template>
<script>
import { getInside, getInsideAccountConfig, exportData } from '@/api/finance/transfer'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapState } from 'vuex'

export default {
  name: 'InsideList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
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
        { label: this.$t('financemanager.financialAccount'), value: 1 },
        { label: this.$t('financemanager.operateABonusAccount'), value: 2 },
        { label: this.$t('financemanager.liquidityAccount'), value: 3 },
        { label: this.$t('contractmanager.feeAccount'), value: 4 },
        { label: this.$t('financemanager.operateLockInAccounts'), value: 5 },
        { label: this.$t('financemanager.experienceFundAccount'), value: 6 },
        { label: this.$t('financemanager.contractFeeRebateAccount'), value: 7 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        type: '',
        currencyId: '',
        userId: ''
      },
      tableData: [{}],
      formTitle: {},
      open: false,
      selectArr: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },
  watch: {
    'form.type': {
      handler(val) {
        this.getInsideAccountConfig(val)
      }
    }
  },

  mounted() {
    this.getConfigList()
  },
  methods: {
    handleSelectionChange() {

    },
    // 导出
    exportData() {
      exportData(this.form).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: this.$t('financemanager.exportSuccessfully')
          })
        }
      })
    },

    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },

    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList() {
      console.log(this.form)
      // this.form.userId= this.selectArr[this.form.userId]
      getInside(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.data.list
          this.formTitle = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getInsideAccountConfig(type) {
      const params = {
        type: type
      }
      getInsideAccountConfig(params).then(res => {
        if (res.code === 200) {
          this.selectArr = []
          res.data.forEach((item, index) => {
            const obj = {
              label: item,
              value: index
            }
            this.selectArr.push(obj)
          })
        } else {
          this.msgError(res.msg)
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
