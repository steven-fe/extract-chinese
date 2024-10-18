<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item :label="$t('userManager.activeID')" prop="activityId">
        <el-input v-model="queryParams.activityId" on size="mini" :placeholder="$t('userManager.activeID')" clearable />
      </el-form-item>
      <el-form-item :label="$t('userManager.launchpadCurrency')" prop="currencyIds">
        <el-select
          v-model="queryParams.currencyIds"
          size="mini"
          filterable
          clearable
          multiple
        >
          <el-option
            v-for="(item,index) in currencyList"
            :key="index"
            :label="item.currencyCode"
            :value="item.currencyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.buyStatus')" prop="statusList">
        <el-select
          v-model="queryParams.statusList"
          size="mini"
          filterable
          clearable
          :placeholder="$t('userManager.buyStatus')"
          multiple
        >
          <el-option
            v-for="(item,index) in orderStatusOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="time" :label="$t('userManager.buyTime')">
        <el-date-picker
          v-model="queryParams.time"
          clearable
          size="mini"
          type="datetimerange"
          :range-separator="$t('userManager.to')"
          :start-placeholder="$t('userManager.startTime')"
          :end-placeholder="$t('userManager.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label prop="symbol">
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{ $t('userManager.search') }}</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <el-table v-loading="loading" border :data="tableData">
      <el-table-column :label="$t('userManager.buyTime')" align="center" prop="subTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.subTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.activeID')" width="180" align="center" prop="activityId" />
      <el-table-column :label="$t('userManager.launchpadCurrency')" align="center" prop="currencyCode" width="180" />
      <el-table-column :label="$t('userManager.buyModeType')" align="center" prop="subscriptionType" width="200">
        <template slot-scope="scope">
          {{ +scope.row.subscriptionType === 1 ? $t('userManager.wlBuy') : $t('userManager.openBuy') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.buyCount')" align="center" prop="subPrice" width="180">
        <template slot-scope="scope">
          {{ `1 ${scope.row.currencyCode} = ${scope.row.subPrice} ${scope.row.subCurrencyCode}` }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.buyPrice')" align="center" prop="subAmount">
        <template slot-scope="scope">
          {{ `${scope.row.subAmount} ${scope.row.subCurrencyCode}` }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.returnAmount')" align="center" prop="returnAmount">
        <template slot-scope="scope">
          {{ scope.row.returnAmount ? scope.row.returnAmount + ' ' + scope.row.subCurrencyCode : '--' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.disAmount')" align="center" prop="distributionAmount">
        <template slot-scope="scope">
          {{ scope.row.distributionAmount ? scope.row.distributionAmount + ' ' + scope.row.currencyCode : '--' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.status')" align="center" prop="status" width="200">
        <template slot-scope="scope">
          {{ orderStatusMap[scope.row.status] }}
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="load"
      />
    </div>
  </div>
</template>

<script>
import { getLaunchpadOrderRecords, getLaunchpadCurrencyList } from '@/api/user'
import dayjs from 'dayjs'
export default {
  name: 'OrderList',
  props: ['msg'],
  data() {
    return {
      loading: false,
      orderStatusOptions: [
        {
          value: 4,
          label: this.$t('userManager.launchpadStatus1')
        },
        {
          value: 2,
          label: this.$t('userManager.launchpadStatus2')
        },
        {
          value: 3,
          label: this.$t('userManager.launchpadStatus3')
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        activityId: '',
        statusList: [],
        currencyIds: [],
        userId: this.msg,
        startTime: '',
        endTime: '',
        time: []
      },
      tableData: [],
      total: 0,
      orderStatusMap: {
        2: this.$t('userManager.launchpadStatus2'),
        3: this.$t('userManager.launchpadStatus3'),
        4: this.$t('userManager.launchpadStatus1')
      },
      currencyList: []
    }
  },
  created() {
    this.getCurrencySortList()
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const newParams = {}
        if (this.queryParams.time && this.queryParams.time.length > 0) {
          this.queryParams.startTime = dayjs(this.queryParams.time[0]).valueOf()
          this.queryParams.endTime = dayjs(this.queryParams.time[1]).endOf('day').valueOf()
        } else {
          this.queryParams.startTime = null
          this.queryParams.endTime = null
        }
        for (const key in this.queryParams) {
          if (Object.hasOwnProperty.call(this.queryParams, key)) {
            const element = this.queryParams[key]
            if (element) {
              newParams[key] = element
            }
          }
        }
        
        const { rows, total } = await getLaunchpadOrderRecords(newParams)
        this.tableData = rows
        this.total = total
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    async getCurrencySortList() {
      try {
        const { data } = await getLaunchpadCurrencyList()
        this.currencyList = data
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
>>> .el-form-item__label {
  width: auto !important;
}
.top {
  margin-top: 20px;
}
</style>
