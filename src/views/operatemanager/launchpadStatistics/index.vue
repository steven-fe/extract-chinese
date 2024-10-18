<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item
        label="项目代币:"
        prop="currencyId"
      >
        <el-select
          v-model="currencySelect"
          size="mini"
          clearable
          filterable
          multiple
          collapse-tags
          placeholder="请选择项目代币"
          @change="selectAllCurency"
        >
          <el-option
            label="全选"
            value="all"
          />
          <el-option
            v-for="item in tokenList"
            :key="item.activityId"
            :label="item.currencyCode"
            :value="item.currencyId"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="活动标签:"
        prop="tags"
      >
        <el-select
          v-model="queryParams.tags"
          size="mini"
          clearable
          :placeholder="$t('common.all')"
        >
          <el-option
            v-for="item in tagsOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="是否开启白名单认购:"
        prop="openState"
      >
        <el-select
          v-model="queryParams.openState"
          size="mini"
          clearable
          :placeholder="$t('common.all')"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          @click="handleQuery"
        >查询</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        label="Launchpad活动id"
        align="center"
        prop="activityId"
      />
      <el-table-column
        label="Launchpad代币"
        align="center"
        prop="currencyCode"
      />
      <el-table-column
        label="发行量"
        align="center"
        prop="totalQuota"
      />
      <el-table-column
        label="认购价格"
        align="center"
        prop="subscriptionPrice"
      />
      <el-table-column
        label="投入币种"
        align="center"
        prop="subCurrencyCode"
      />
      <el-table-column
        label="公开认购基础额度"
        align="center"
        prop="basicsQuota"
      />
      <!-- <el-table-column
        label="白名单用户认购数量"
        align="center"
        prop="wlSubQuota"
      /> -->
      <el-table-column
        label="活动时间"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime) }} <br>|<br> {{ parseTime(scope.row.endTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="活动标签"
        align="center"
        prop="tags"
      />

      <el-table-column
        label="是否开启白名单认购"
        align="center"
        prop="openState"
      >
        <template slot-scope="scope">
          <div
            v-for="(item, index, key) in typeOptions"
            :key="key"
          >
            <span v-if="scope.row.openState === item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="公开认购参与人数"
        align="center"
        prop="joinTotalCount"
      />
      <el-table-column
        label="公开认购参与总额度"
        align="center"
        prop="joinTotalQuota"
      />
      <el-table-column
        label="公开认购实际参与活动额度"
        align="center"
        prop="lastTotalQuotas"
      />
      <!-- <el-table-column
        label="实际参与币种"
        align="center"
        prop="subCurrencyCode"
      /> -->
      <el-table-column
        label="公开认购实际分配数量"
        align="center"
        prop="disTotalNumbers"
      />
      <el-table-column
        label="公开认购实际到账数量"
        align="center"
        prop="accountNumber"
      />
      <el-table-column
        label="白名单参与人数"
        align="center"
        prop="wlSubCount"
      />
      <el-table-column
        label="白名单实际分配数量"
        align="center"
        prop="wlDistributionQty"
      />
      <el-table-column
        label="白名单实际到账数量"
        align="center"
        prop="wlAccountQty"
      />
      <el-table-column
        label="公开认购提额用户数"
        align="center"
        prop="promoteCount"
      />
      <el-table-column
        label="任务获取白名单人数"
        align="center"
        prop="wlTaskCount"
      />
      <!-- <el-table-column
        label="完成kyc任务用户数"
        align="center"
        prop="kycCount"
      /> -->
      <el-table-column
        label="活动期间完成KYC用户数"
        align="center"
        prop="activityKycCount"
      />
      <el-table-column
        label="活动期间现货交易人数"
        align="center"
        prop="tradeCount"
      />
      <el-table-column
        label="活动期间现货总交易额"
        align="center"
        prop="tradeAmount"
      />
      <el-table-column
        label="活动期间入金人数"
        align="center"
        prop="rechargeCounts"
      />
      <el-table-column
        label="活动期间入金数量"
        align="center"
        prop="rechargeAmounts"
      />
      <el-table-column
        label="活动期间入金币种"
        align="center"
        prop="rechargeCode"
      />
      <el-table-column
        label="活动期间受邀人数"
        align="center"
        prop="invitation"
      />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { statistics, currencyList, exportStatistics } from '@/api/launchpad'

const formatText = (value) => typeof value === 'number' ? value : value || '-'

export default {
  name: 'Launchpad',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      dataList: [],
      time: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        currencyId: undefined,
        openState: '',
        tags: ''
      },
      tokenList: [],
      currencySelect: [],
      currencySelectAll: false, // currency是否全选
      typeOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 1,
          label: '是'
        },
        {
          value: 0,
          label: '否'
        }
      ],
      tagsOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'Prime',
          label: 'Prime'
        },
        {
          value: 'Startup',
          label: 'Startup'
        },
        {
          value: 'Token-sale',
          label: 'Token-sale'
        }
      ],
      lockOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 0,
          label: '未锁仓'
        },
        {
          value: 1,
          label: '锁仓'
        }
      ]
    }
  },
  computed: {

  },
  created() {
    this.getList()
    this.getTokenList()
  },
  methods: {
    // 活动币种列表
    getTokenList() {
      currencyList()
        .then((response) => {
          if (response.code == 200) {
            this.tokenList = response.data
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    selectAllCurency(arr) {
      const index = arr.findIndex(item => item === 'all')
      if (index !== -1 && !this.currencySelectAll) {
        this.currencySelect = this.tokenList.map(item => item.currencyId)
        this.currencySelect.push('all')
        this.currencySelectAll = true
      }
      if (this.currencySelectAll && index === -1) {
        this.currencySelect = []
        this.currencySelectAll = false
      }
    },
    /** 列表 */
    getList() {
      statistics(this.queryParams).then(response => {
        this.dataList = response.rows
        this.dataList.forEach((item) => {
          item.joinTotalCount = formatText(item.joinTotalCount)
          item.joinTotalQuota = formatText(item.joinTotalQuota)
          item.subCurrencyCode = formatText(item.subCurrencyCode)
          item.lastTotalQuotas = formatText(item.lastTotalQuotas)
          item.disTotalNumbers = formatText(item.disTotalNumbers)
          item.promoteCount = formatText(item.promoteCount)
          item.kycCount = formatText(item.kycCount)
          item.activityKycCount = formatText(item.activityKycCount)
          item.tradeCount = formatText(item.tradeCount)
          item.tradeAmount = formatText(item.tradeAmount)
          item.rechargeCounts = formatText(item.rechargeCounts)
          item.rechargeAmounts = formatText(item.rechargeAmounts)
          item.rechargeCode = formatText(item.rechargeCode)
          item.invitation = formatText(item.invitation)
        })
        this.total = response.total
        this.loading = false
      }).catch((err) => {
        this.loading = false
        console.log(err)
      })
    },
    // 格式化请求参数
    formatParams() {
      if (this.currencySelect.length == 0) {
        this.queryParams.currencyId = undefined
      } else {
        this.queryParams.currencyId = this.currencySelect.join(',')
      }
      if (!this.queryParams.type) {
        this.queryParams.type = undefined
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.formatParams()
      this.getList()
    },
    // 表单重置
    reset() {
      this.dialogForm = {
      }
      this.resetForm('dialogForm')
    },
    /** 导出按钮操作 */
    handleExport() {
      const _this = this
      this.formatParams()
      this.$confirm('是否确认导数据？', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return exportStatistics(_this.queryParams)
      })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() { })
    }
    // handleHeaderStyle ({ row, column, rowIndex, columnIndex }) {
    //   let cellStyle1 = 'background:red;'
    //   let cellStyle2 = 'background:green;'
    //   let cellStyle3 = 'background:pink;'
    //   if (columnIndex >= 0 && columnIndex < 9 && rowIndex === 1) {
    //     return cellStyle1
    //   }
    //   if (columnIndex >= 8 && columnIndex < 18 && rowIndex === 1) {
    //     return cellStyle2
    //   }
    //   if (columnIndex >= 18 && rowIndex === 1) {
    //     return cellStyle3
    //   }
    // }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-table .el-table__header-wrapper {
    th:nth-child(-n + 9) {
      background: #496aff;
      color: #fff;
    }
    th:nth-child(n + 10):nth-child(-n + 14) {
      background: #f6a04d;
      color: #fff;
    }
    th:nth-child(n + 15):nth-child(-n + 17) {
      background: #e3491a;
      color: #fff;
    }
    th:nth-child(n + 18) {
      background: #00bc7b;
      color: #fff;
    }
  }
}
</style>
