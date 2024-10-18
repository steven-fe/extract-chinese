<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="150px">
      <el-form-item :label="$t('financemanager.businessScenario')" prop="code">
        <el-select v-model="form.sceneType" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="code">
        <el-select v-model="form.currencyId" style="width: 100%" filterable :placeholder="$t('financemanager.currencyCode1')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.giftBatchNumber')" :placeholder="$t('financemanager.pleaseEnterTheGrantBatchNumber')">
        <el-input v-model="form.batchNumber" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.useruid')" :placeholder="$t('financemanager.pleaseEnterUserUID')">
        <el-input v-model="form.uid" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.grantDate')">
        <el-date-picker
          v-model="date"
          type="daterange"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          align="right"
          value-format="timestamp"
          @change="timeChange"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="state">
        <el-select v-model="form.state" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportData">{{ $t('common.derive') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="batchNumber" :label="$t('financemanager.giftLot')" align="center" />
      <el-table-column :label="$t('financemanager.actualDateOfGift')" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.transferTime | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="chainProtocol" :label="$t('financemanager.businessScenario')" align="center">
        <template slot-scope="scope">{{ typeLabel(typeOptions, scope.row.sceneType) }}</template>
      </el-table-column>
      <el-table-column prop="uid" :label="$t('financemanager.userUID')" align="center" width="160" />
      <el-table-column prop="userName" :label="$t('financemanager.userName')" align="center" />
      <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
      <el-table-column prop="volume" :label="$t('financemanager.quantityOfGift')" align="center" />
      <el-table-column prop="remark" :label="$t('common.remarks')" align="center" />
      <el-table-column prop="operator" :label="$t('financemanager.operatorName')" align="center" />
      <el-table-column prop="errorReason" :label="$t('financemanager.reasonsForTheFailureOfTheGift')" align="center" />
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">{{ typeLabel(stateOptions, scope.row.state) }}</template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        :page-sizes="[10, 20, 30, 50, 100, 500, 1000, 2000]"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { freeList, exportData } from '@/api/finance/freecurrency'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'

export default {
  name: 'Freecurrencylist',
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
      typeOptions: [
        { label: this.$t('common.signUp'), value: 0 },
        { label: this.$t('financemanager.realNameRegistration'), value: 1 },
        { label: this.$t('financemanager.invite'), value: 2 },
        { label: this.$t('financemanager.marketMaking'), value: 3 },
        { label: this.$t('financemanager.other'), value: 4 },
        { label: this.$t('financemanager.userAssetRecovery'), value: 6 }
      ],
      stateOptions: [
        { label: this.$t('common.all'), value: -1 },
        { label: this.$t('dbmanager.unreviewed'), value: 0 },
        { label: this.$t('financemanager.alreadyPassed'), value: 1 },
        { label: this.$t('financemanager.rejected'), value: 2 },
        { label: this.$t('financemanager.giftHasBeenComplete'), value: 3 },
        { label: this.$t('financemanager.giftFailure'), value: 4 }
      ],
      total: 0,
      configId: '',
      form: {
        sceneType: '',
        currencyId: '',
        batchNumber: '',
        uid: '',
        sTime: '',
        eTime: '',
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}]
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
    this.getConfigList()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 导出
    exportData() {
      this.form.pageName = this.$t('financemanager.grantList')
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
    // 日期改变事件
    timeChange(val) {
      if (val) {
        this.form.sTime = val[0]
        this.form.eTime = val[1]
        return
      }
      this.form.sTime = ''
      this.form.eTime = ''
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      freeList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
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
