<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="150px">
      <el-form-item :label="$t('common.coin')" prop="codeOptions">
        <el-select v-model="form.currencyId" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')" filterable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.serviceId')">
        <el-input v-model="form.businessId" :placeholder="$t('financemanager.pleaseEnterTheServiceId')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.transferToUID')">
        <el-input v-model="form.toUid" :placeholder="$t('financemanager.pleaseEnterEnterUID')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.rollOutUID')">
        <el-input v-model="form.fromUid" :placeholder="$t('financemanager.pleaseEnterRollOutUID')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.targetAccountType')" prop="code">
        <el-select v-model="form.businessType" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in accountTypeOptions"
            :key="item.accountType"
            :label="item.accountDesc"
            :value="item.accountType"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.businessType')">
        <el-input v-model="form.businessTypeName" :placeholder="$t('financemanager.businessType')" clearable />
      </el-form-item>
      <el-form-item :label="$t('financemanager.transferDate')">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="exportData">{{ $t('common.derive') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="ID" align="center" width="100" />
      <el-table-column prop="bid" :label="$t('financemanager.serviceId')" align="center" />
      <el-table-column prop="businessTypeSecondName" :label="$t('financemanager.subbusinessType')" align="center" />
      <el-table-column prop="businessTypeFirstName" :label="$t('financemanager.businessType')" align="center" />
      <el-table-column prop="fromUserAccount" :label="$t('financemanager.accountsOfSourceOfFunds')" align="center" />
      <el-table-column prop="fromUid" :label="$t('financemanager.rollOutUID')" align="center">
        <template slot-scope="scope">
          {{ scope.row.fromUid?scope.row.fromUid:scope.row.fromUserId }}
        </template>
      </el-table-column>
      <el-table-column prop="toUserAccount" :label="$t('financemanager.targetAccount')" align="center" />
      <el-table-column prop="toUid" :label="$t('financemanager.transferToUID')" align="center">
        <template slot-scope="scope">
          {{ scope.row.toUid?scope.row.toUid:scope.row.toUserId }}
        </template>
      </el-table-column>
      <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
      <el-table-column prop="volume" :label="$t('financemanager.quantity')" align="center" />
      <el-table-column :label="$t('financemanager.time')" align="center">
        <template slot-scope="scope">{{ scope.row.updatedAt | timeFilter }}</template>
      </el-table-column>
      <el-table-column prop="remarks" :label="$t('common.remarks')" align="center" />
      <el-table-column prop="operator" :label="$t('financemanager.operator')" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getConfigList"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { transferRecord, dataExport, getSystemAirdropTransferType } from '@/api/finance/freecurrency'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'

export default {
  name: 'Systemtransferrecord',
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
      accountTypeOptions: [],
      form: {
        currencyId: '',
        businessType: '',
        sTime: '',
        eTime: '',
        businessId: '',
        fromUid: '',
        toUid: '',
        businessTypeName: '',
        pageNum: 1,
        pageSize: 10,
        fromUserId: '',
        toUserId: ''
      },
      time: '',
      total: 0,
      date: '',
      tableData: [{}],
      accountOptions: []
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
    this.getAccountTypeOptions()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 日期改变事件
    // timeChange(val) {
    //   if (val) {
    //     this.form.sTime = val[0]
    //     this.form.eTime = val[1]
    //     return
    //   }
    //   this.form.sTime = ''
    //   this.form.eTime = ''
    // },
    getAccountTypeOptions() {
      getSystemAirdropTransferType().then(response => {
        if (response.code === 200) {
          this.accountTypeOptions = response.data
        }
      })
    },
    getConfigList(flag) {
      if (flag) {
        this.pageNum = 1
      }
      this.form.sTime = this.time && this.time[0] || null
      this.form.eTime = this.time && this.time[1] || null
      transferRecord(this.form).then(response => {
        if (+response.code === 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 导出
    exportData() {
      dataExport(this.form).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: this.$t('financemanager.exportSuccessfully')
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
