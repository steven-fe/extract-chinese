<template>
  <div style="padding-bottom: 20px">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item :label="$t('userManager.symbols')" prop="contractId">
        <el-select
          v-model="queryParams.contractId"
          size="mini"
          filterable
          clearable
        >
          <el-option value="" :label="$t('userManager.all')" />
          <el-option
            v-for="(item,index) in contractOptions"
            :key="index"
            :label="item.displayName"
            :value="item.contractId"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.side')" prop="side">
        <el-select
          v-model="queryParams.side"
          size="mini"
          clearable
          :placeholder="$t('userManager.all')"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.closePositionTime')">
        <el-date-picker
          v-model="time"
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
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()"> {{ $t('userManager.search') }} </el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <el-table ref="table" v-loading="loading" border :data="tableData">
      <el-table-column :label="$t('userManager.symbols')" align="center" prop="currencyId">
        <template slot-scope="scope">
          {{ filterCurrency(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.sideType')" align="center" prop="side">
        <template slot-scope="scope">
          {{ +scope.row.side > 0 ? $t('userManager.goingLong') : $t('userManager.shortSell') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.closePositionCount')" align="center" prop="bidPnl">
        <template slot-scope="scope">
          {{ +scope.row.side > 0 ? scope.row.bidPnl : scope.row.askPnl }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.closePositionNum')" align="center" prop="matchQty" />
      <el-table-column :label="$t('userManager.closePositionPrice')" align="center" prop="matchPrice" />
      <el-table-column :label="$t('userManager.closePositionTime')" align="center" prop="matchTime">
        <template slot-scope="scope">
          {{ parseTime(scope.row.matchTime / 1000) }}
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
import { getContractHisMatch } from '@/api/user'
import dayjs from 'dayjs'
export default {
  name: 'ContractProfltLoss',
  props: ['msg', 'uid', 'contractOptions'],
  data() {
    return {
      time: undefined,
      loading: false,
      // 查询参数
      queryParams: {
        userId: this.msg,
        contractId: null,
        side: null,
        startTime: null,
        endTime: null,
        pageNum: 1,
        pageSize: 200
      },
      // 买入卖出状态
      typeOptions: [
        {
          value: '',
          label: this.$t('userManager.all')
        },
        {
          value: -1,
          label: this.$t('userManager.shortSell')
        },
        {
          value: 1,
          label: this.$t('userManager.goingLong')
        }
      ],
      tableData: [],
      total: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      if (this.time && this.time.length > 0) {
        this.queryParams.startTime = dayjs(this.time[0]).valueOf()
        this.queryParams.endTime = dayjs(this.time[1]).endOf('day').valueOf()
      } else {
        this.queryParams.startTime = null
        this.queryParams.endTime = null
      }
      getContractHisMatch(this.queryParams)
        .then(res => {
          this.loading = false
          this.tableData = res.data
        })
        .catch(error => {
          console.log(error)
          this.loading = false
        })
    },
    filterCurrency(row) {
      const findItem = this.contractOptions.find(item => item.contractId === row.contractId)
      return findItem && findItem.displayName || '--'
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

  .top {
    margin-top: 20px;
  }
</style>
