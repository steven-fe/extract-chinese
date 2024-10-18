<template>
  <div class="app-container">
    <!-- form -->
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

    <!-- table -->
    <el-table v-loading="loading" :data="inviteRankingList" border>
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <!-- <el-table-column label="用户ID" align="center" prop="uid" /> -->
      <el-table-column label="用户ID" align="center">
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
      <el-table-column label="总邀请人数" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.inviteNum">
            <el-link type="primary" :underline="false" @click="toUserInviteList(scope.row, '1')">
              {{ scope.row.inviteNum }}
            </el-link>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="直接邀请人数" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.directInviteNum">
            <el-link type="primary" :underline="false" @click="toUserInviteList(scope.row, '2')">
              {{ scope.row.directInviteNum }}
            </el-link>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="间接邀请人数" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.indirectInviteNum">
            <el-link type="primary" :underline="false" @click="toUserInviteList(scope.row, '3')">
              {{ scope.row.indirectInviteNum }}
            </el-link>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="网体合约交易人数" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.treeTradeNum">
            <el-link type="primary" :underline="false" @click="toUserInviteList(scope.row, '4')">
              {{ scope.row.treeTradeNum }}
            </el-link>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="网体合约交易额" align="center" prop="treeTradeAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.treeTradeAmt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="获得合约返佣" align="center" prop="inInvAmt">
        <template slot-scope="scope">
          <span>
            {{ dealNumValue(scope.row.inInvAmt) }}
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
  name: 'InviteRanking',
  data() {
    return {
      // 币种列表
      marList: [],
      // 排序规则
      ruleOptions: [
        {
          'col': 'inviteNum',
          'colName': '按总邀请人数排名'
        },
        {
          'col': 'directInviteNum',
          'colName': '按直接邀请人数排名'
        },
        {
          'col': 'indirectInviteNum',
          'colName': '按间接邀请人数排名'
        },
        {
          'col': 'treeTradeNum',
          'colName': '按网体合约交易人数排名'
        },
        {
          'col': 'treeTradeAmt',
          'colName': '按网体合约交易额排名'
        },
        {
          'col': 'inInvAmt',
          'colName': '按获得合约返佣排名'
        }
      ],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 合约统计排名表格数据
      inviteRankingList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        currency: undefined,
        pageType: 2,
        rankingRule: 'inviteNum'
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
        this.inviteRankingList = response.rows
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
    // 各类邀请人列表
    toUserInviteList(row, type) {
      this.$router.push({ name: 'toUserInviteList', query: { uid: row.uid, type: type, tradeDate: row.tradeDate, currency: row.currency }})
    },

    // 处理0和null
    dealNumValue(val) {
      return val == null ? 0 : val
    }
  }
}
</script>
