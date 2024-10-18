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
      <el-form-item :label="$t('userManager.type')" prop="type">
        <el-select
          v-model="queryParams.type"
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
      <el-form-item :label="$t('userManager.forcedTime')">
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
      <el-form-item label>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="queryData()">{{ $t('userManager.search') }}</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <el-table ref="table" v-loading="loading" border :data="tableData">
      <el-table-column :label="$t('userManager.forcedTime')" align="center" prop="ts">
        <template slot-scope="scope">
          {{ parseTime(scope.row.ts) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.symbols')" align="contractId">
        <template slot-scope="scope">
          {{ filterCurrency(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.side')" align="center" prop="side">
        <template slot-scope="scope">
          <span v-if="scope.row.side == 1">{{ $t('userManager.shortSell') }}</span>
          <span v-if="scope.row.side == -1">{{ $t('userManager.goingLong') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.positionType')" align="center" prop="isolated">
        <template slot-scope="scope">
          {{ scope.row.isolated ? $t('userManager.positionType1') : $t('userManager.positionType2') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.type')" align="center" prop="type">
        <template slot-scope="scope">
          {{ filterType(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.operate')" align="center" prop="orderId">
        <template slot-scope="scope">
          <el-button type="text" @click="getOrderDetail(scope.row)">{{ $t('userManager.getDetail') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="block top" style="margin-top: 20px;">
      <FlowPage
        :page-size="pageSize"
        :is-prev-page="flowPageParams.isPrevPage"
        :is-next-page="flowPageParams.isNextPage"
        @pageChange="pageChange"
        @sizesChange="sizesChange"
      />
    </div>
    <!-- 订单列表 -->
    <el-dialog :title="$t('userManager.detailList')" :close-on-click-modal="false" :visible.sync="orderListVisible" width="70%">
      <el-table :data="orderData">
        <el-table-column property="openPrice" width="180" :label="$t('userManager.openPositionAvgPrice')" />
        <el-table-column property="triggerPrice" width="180" :label="$t('userManager.triggerPrice')" />
        <el-table-column property="execSize" width="180" :label="$t('userManager.successAmount')" />
        <el-table-column property="size" width="180" :label="$t('userManager.positionAmount')" />
        <el-table-column property="equity" width="180" :label="$t('userManager.positionProfit')" />
        <el-table-column property="maintMargin" width="180" :label="$t('userManager.securityDeposit')" />
        <el-table-column property="insurance" width="180" :label="$t('userManager.punishment')" />
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { getContractStrongOrder } from '@/api/user'
import FlowPage from '@/components/FlowPage'
import dayjs from 'dayjs'
export default {
  name: 'ContractClosePosition',
  components: {
    FlowPage
  },
  props: ['msg', 'contractOptions'],
  data() {
    return {
      time: [],
      loading: false,
      // 查询参数
      queryParams: {
        userId: this.msg,
        id: null,
        pageSize: this.pageSize,
        contractId: null,
        type: '',
        startTime: '',
        endTime: ''
      },
      pageSize: 20,
      tableData: [],
      typeOptions: [
        {
          value: '',
          label: this.$t('userManager.all')
        },
        {
          value: 'FL',
          label: this.$t('userManager.FL')
        },
        {
          value: 'CREATE',
          label: this.$t('userManager.CREATE')
        },
        {
          value: 'ADL',
          label: this.$t('userManager.ADL')
        },
        {
          value: 'takeover',
          label: this.$t('userManager.takeover')
        },
        {
          value: 'SELF',
          label: this.$t('userManager.SELF')
        }
      ],
      orderListVisible: false,
      orderData: [],
      flowPageParams: {
        isPrevPage: true, // 是否第一页
        isNextPage: true, // 是否有下一页
        queryPageId: null,
        lastData: null, // 最后一条数据
        firstPageId: null // 第一页数据的ID, 用于判断是否第一页
      }
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
      this.queryParams.pageSize = this.pageSize
      getContractStrongOrder(this.queryParams)
        .then(response => {
          const data = response.data
          if (data.length < this.pageSize + 1) {
            this.flowPageParams.isNextPage = false
          }
          if (data && data.length > 0) {
            if (!this.flowPageParams.firstPageId) {
              this.flowPageParams.firstPageId = data[0].id
            } else if (data[0].id === this.flowPageParams.firstPageId) {
              this.flowPageParams.isPrevPage = true
            }
          }
          this.tableData = this.splicePageData(data)
          this.loading = false
        })
        .catch(error => {
          this.loading = false
          console.log(error)
        })
    },
    splicePageData(data) {
      this.flowPageParams.lastData = data[data.length - 1]
      return data.slice(0, this.pageSize)
    },
    getOrderDetail(row) {
      this.orderListVisible = true
      this.orderData = [row]
    },
    filterCurrency(row) {
      const findItem = this.contractOptions.find(item => item.contractId === row.contractId)
      return findItem && findItem.displayName ? findItem.displayName : '--'
    },
    filterType(row) {
      const typeMap = [
        {
          value: 'FL',
          label: this.$t('userManager.FL')
        },
        {
          value: 'CREATE',
          label: this.$t('userManager.CREATE')
        },
        {
          value: 'ADL',
          label: this.$t('userManager.ADL')
        },
        {
          value: 'takeover',
          label: this.$t('userManager.takeover')
        },
        {
          value: 'SELF',
          label: this.$t('userManager.SELF')
        }
      ]
      const findItem = typeMap.find(item => item.value === row.type)
      return findItem && findItem.label
    },
    sizesChange(val) {
      this.pageSize = val
      this.queryData()
    },
    queryData() {
      this.resetPageParams()
      this.load()
    },
    pageChange(type) {
      if (type === 'next') {
        this.queryParams.side = 1
        this.queryParams.id = this.flowPageParams.lastData.id
        this.flowPageParams.isPrevPage = false
      }
      if (type === 'prev') {
        this.queryParams.side = -1
        this.queryParams.id = this.tableData[0].id
        this.flowPageParams.isNextPage = true
      }
      this.load()
    },
    resetPageParams() {
      this.flowPageParams = {
        isPrevPage: true,
        isNextPage: true,
        queryPageId: null,
        lastData: null,
        firstPageId: null
      }
      this.queryParams.side = 1
      this.queryParams.id = null
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
