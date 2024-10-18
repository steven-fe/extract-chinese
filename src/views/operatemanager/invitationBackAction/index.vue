<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="邀请人" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="输入ID或账号查询"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="被邀请人" prop="beuserId">
        <el-input
          v-model="queryParams.beuserId"
          placeholder="输入ID或账号查询"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="返佣币种" prop="goodsId">
        <el-select v-model="queryParams.goodsId" clearable size="mini" placeholder="请选择返佣币种">
          <el-option
            v-for="(item, index) in goodsMarginList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期：" prop="time">
        <el-date-picker
          v-model="queryParams.time"
          size="mini"
          type="daterange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="actionList"
      border
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column label="返佣日期" align="center" prop="transactionTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.transactionTime,'{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员ID" align="center" prop="userId" />
      <el-table-column label="会员账号" align="center" prop="userAccount" />
      <el-table-column label="会员VIP等级" align="center" prop="levelName" />
      <el-table-column label="被邀请人ID" align="center" prop="beuserId" />
      <el-table-column label="被邀请人账号" align="center" prop="beuserAccount" />
      <el-table-column label="被邀请层级" align="center" prop="invitationLevel" />
      <el-table-column label="被邀请人开仓交易额" align="center" prop="openTradeAmount" />
      <el-table-column label="被邀请人平仓交易额" align="center" prop="closeTradeAmount" />
      <el-table-column label="返佣币种" align="center" prop="goodsId" />
      <el-table-column label="返佣金额" align="center" prop="invitationValue" />
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
import {
  listAction,
  exportAction
} from '@/api/invitation/invitationBackAction'
import { listCoinGoods } from '@/api/contract/coin'

export default {
  data() {
    return {
      // 币种列表
      goodsMarginList: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 返佣明细表格数据
      actionList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        beuserId: undefined,
        goodsId: undefined,
        time: undefined
      },
      choseDate: undefined,
      pickerOptions: this.limitDate()
    }
  },
  created() {
    this.getListCoinGoodsList()
    this.getList()
  },
  methods: {
    // 商品id列表
    getListCoinGoodsList() {
      listCoinGoods().then((response) => {
        if (response.code == 200) {
          this.goodsMarginList = this.unique3(response.rows)
        }
      })
    },
    // 过滤
    unique3(arr) {
      const res = new Map()
      return arr.filter(
        (arr) =>
          !res.has(arr.marginCoin) &&
          res.set(arr.marginCoin, 1) &&
          arr.marginCoin != 'BTFBLP'
      )
    },
    limitDate() {
      return {
        onPick: (time) => {
          if (time.minDate) {
            this.choseDate = time.minDate.getTime()
          }
          if (time.maxDate) {
            this.choseDate = undefined
          }
        },
        disabledDate: (time) => {
          const one = 1 * 24 * 3600 * 1000
          if (!this.choseDate) {
            // return time.getTime() > Date.now();
          } else {
            return (
              // time.getTime() > Date.now() ||
              time.getTime() < this.choseDate ||
              time.getTime() > this.choseDate + one * 7
            )
          }
        }
      }
    },
    /** 查询返佣明细列表 */
    getList() {
      this.loading = true
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        userId: this.queryParams.userId,
        beuserId: this.queryParams.beuserId,
        goodsId: this.queryParams.goodsId,
        beginTime: (this.queryParams.time && this.queryParams.time[0]) || '',
        endTime: (this.queryParams.time && this.queryParams.time[1]) || ''
      }
      listAction(params).then((response) => {
        this.actionList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出返佣详情数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportAction(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function(error) {})
    },
    getSummaries(param) {
      if (this.selectSymbol != '') {
        const { columns, data } = param
        const sums = []
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '合计'
          } else if (index == 7 || index == 8 || index == 10) {
            const values = data.map((item) => Number(item[column.property]))
            if (!values.every((value) => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr)
                if (!isNaN(value)) {
                  return this.addLong(prev, curr)
                } else {
                  return prev
                }
              }, 0)
            }
          } else {
            sums[index] = ''
          }
        })
        return sums
      } else {
        return false
      }
    }
  }
}
</script>
