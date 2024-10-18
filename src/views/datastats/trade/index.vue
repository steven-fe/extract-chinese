<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
      <el-form-item label="用户ID" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户ID"
          size="mini"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保证金币种" prop="currency">
        <el-select v-model="queryParams.currency" placeholder="请选择保证金币种" size="mini" clearable>
          <el-option
            v-for="(item, index) in marList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序规则" prop="rankingRule">
        <el-select v-model="queryParams.rankingRule" placeholder="请选择排序规则" size="mini">
          <el-option
            v-for="item in ruleOptions"
            :key="item.col"
            :label="item.colName"
            :value="item.col"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tradeRankingList" border>
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <!-- <el-table-column label="用户ID" align="center" prop="uid" /> -->
      <el-table-column label="用户ID">
        <template slot-scope="scope">
          <span v-if="scope.row.uid">
            <el-link type="primary" :underline="false" @click="toUserInfo(scope.row)">
              {{ scope.row.uid }}
            </el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金币种" align="center" prop="currency" />
      <el-table-column label="交易笔数" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.tradeNum">
            <el-link type="primary" :underline="false" @click="toOrderList(scope.row)">
              {{ dealNumValue(scope.row.tradeNum) }}
            </el-link>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="胜率" align="center" prop="tradeRate">
        <template slot-scope="scope">
          <span v-if="scope.row.tradeRate != 0 && scope.row.tradeRate != null ">
            {{ algorithmMul(scope.row.tradeRate, 100) }}%
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="总盈利" align="center" prop="totalProfitAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.totalProfitAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="总亏损" align="center" prop="totalLossAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.totalLossAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="净盈利" align="center" prop="profitAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.profitAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="累计交易额" align="center" prop="tradeAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.tradeAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="累计手续费" align="center" prop="feeAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.feeAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="累计资金费用" align="center" prop="fundingFeeAmt" width="100">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.fundingFeeAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="累计过夜费" align="center" prop="dayFeeAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.dayFeeAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="贡献合约返佣" align="center" prop="outInvAmt" width="100">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.outInvAmt) }}
          </span>
        </template>
      </el-table-column>
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
import { listCoinMar } from '@/api/contract/margin'
import { listRanking } from '@/api/datastats/ranking'

export default {
  name: 'TradeRanking',
  data() {
    return {
      // 币种列表
      marList: [],
      // 排序规则
      ruleOptions: [
        {
          'col': 'tradeNum',
          'colName': '按交易笔数排名'
        },
        {
          'col': 'tradeRate',
          'colName': '按胜率排名'
        },
        {
          'col': 'totalProfitAmt',
          'colName': '按总盈利排名'
        },
        {
          'col': 'totalLossAmt',
          'colName': '按总亏损排名'
        },
        {
          'col': 'profitAmt',
          'colName': '按净盈利排名'
        },
        {
          'col': 'tradeAmt',
          'colName': '按累计交易额排名'
        },
        {
          'col': 'feeAmt',
          'colName': '按累计手续费排名'
        },
        {
          'col': 'fundingFeeAmt',
          'colName': '按累计资金费用排名'
        },
        {
          'col': 'dayFeeAmt',
          'colName': '按累计过夜费排名'
        },
        {
          'col': 'outInvAmt',
          'colName': '按贡献合约返佣排名'
        }
      ],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 合约统计排名表格数据
      tradeRankingList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        currency: undefined,
        pageType: 1,
        rankingRule: 'tradeNum'
      }
    }
  },
  created() {
    this.getMarList()
    this.getList()
  },
  methods: {
    // 商品id列表
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            this.marList = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 查询合约统计排名列表 */
    getList() {
      this.loading = true
      listRanking(this.queryParams).then(response => {
        this.tradeRankingList = response.rows
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
    // 索引值
    indexMethod(index) {
      return index + (this.queryParams.pageNum - 1) * this.queryParams.pageSize + 1
    },
    // 详情跳转
    toUserInfo(row) {
      sessionStorage.setItem('uid', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 订单跳转
    toOrderList(row) {
      this.$router.push({ name: 'Order', query: { tradeUid: row.uid, tradeCurrency: row.currency, tradeStatus: '2' }})
    },

    // 处理0和null
    dealNumValue(val) {
      return val == null ? 0 : val
    }
  }
}
</script>
