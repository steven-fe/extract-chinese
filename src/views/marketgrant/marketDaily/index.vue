<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="做市币种" prop="currency" label-width="85px">
        <el-select
          v-model="queryParams.currency"
          size="mini"
          filterable
          placeholder="请选择做市币种"
        >
          <el-option
            v-for="(item, index) in currencyList"
            :key="index"
            :label="item.label"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="做市商等级" prop="levelId" label-width="85px">
        <el-select
          v-model="queryParams.levelId"
          size="mini"
          filterable
          placeholder="请选择做市商等级"
        >
          <el-option
            v-for="(item, index) in levelIdOptions"
            :key="index"
            :label="item.levelName + '做市商'"
            :value="item.levelId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="daterange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="时间" align="center" prop="txnDate">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.txnDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="做市币种" align="center" prop="currency" />
      <el-table-column label="做市商ID" align="center" prop="marketId">
        <template slot-scope="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="toUserInfo(scope.row, 1)"
          >{{ scope.row.marketId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="做市商等级" align="center" prop="levelId">
        <template slot-scope="scope">
          <span v-if="scope.row.levelId">
            <span v-for="opt in levelIdOptions" :key="opt.levelId">
              <span v-if="scope.row.levelId == opt.levelId">{{
                opt.levelName + "做市商"
              }}</span>
            </span>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="贡献交易人数" align="center" prop="txnUserNum" />
      <el-table-column label="贡献交易笔数" align="center" prop="txnNum" />
      <el-table-column label="贡献交易金额" align="center" prop="txnAmt" />
      <el-table-column label="贡献手续费" align="center" prop="txnFee" />
      <el-table-column label="下级盈亏" align="center" prop="txnProfitAmt" />
      <el-table-column label="做市收益" align="center" prop="marketProfitAmt" />
      <el-table-column
        label="为平台创造收益"
        align="center"
        prop="platformProfitAmt"
        width="115"
      />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listCoinMar } from '@/api/contract/margin'
import { levelList } from '@/api/marketgrant/marketLevel'
import { dailyList } from '@/api/marketgrant/makerDaily'
export default {
  name: 'MarketDaily',
  data() {
    return {
      coininfo: undefined,
      time: undefined,
      loading: true,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: undefined,
        endTime: undefined,
        currency: undefined,
        levelId: undefined
      },
      tableData: [],
      levelIdOptions: [],
      currencyList: []
    }
  },
  created() {
    this.getMarginCoinList()
    this.getMarLevelList()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      dailyList(this.queryParams).then((response) => {
        this.tableData = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    getMarginCoinList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          this.coininfo = response.rows
          this.coininfo.forEach((element) => {
            this.$set(element, 'label', element.marginCoin)
          })
          this.currencyList = [
            { marginCoin: undefined, label: this.$t('common.all') },
            ...this.coininfo
          ]
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 做市等级列表
    getMarLevelList() {
      levelList().then((response) => {
        if (response.code == 200) {
          if (this.levelIdOptions) {
            this.levelIdOptions = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.time = undefined
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        language: undefined,
        articleTypeId: undefined,
        title: undefined
      }
      this.handleQuery()
    },
    // 跳转
    toUserInfo(row, type) {
      switch (type) {
        case 1:
          this.$router.push({
            name: 'marketInfo',
            query: {
              uid: row.uid
            }
          })
          break
      }
    }
  }
}
</script>

<style scoped>
</style>
