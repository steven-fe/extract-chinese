<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户账号" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户ID"
          size="mini"
          clearable
        />
      </el-form-item>
      <el-form-item label="做市商ID" prop="marketId">
        <el-input
          v-model="queryParams.marketId"
          placeholder="请输入做市商ID"
          size="mini"
          clearable
        />
      </el-form-item>
      <el-form-item label="排序规则" prop="rankingRule">
        <el-select
          v-model="queryParams.rankingRule"
          placeholder="请选择排序规则"
          size="mini"
        >
          <el-option
            v-for="item in ruleOptions"
            :key="item.col"
            :label="item.colName"
            :value="item.col"
          />
        </el-select>
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
    <el-table v-loading="loading" border :data="tableList">
      <el-table-column label="做市商ID" align="center" prop="marketId">
        <template slot-scope="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="toUserInfo(scope.row, 1)"
          >{{ scope.row.marketId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="做市币种" align="center" prop="currency" />
      <el-table-column label="用户ID" align="center" prop="uid">
        <template slot-scope="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="toUserInfo(scope.row, 2)"
          >{{ scope.row.uid }}</el-link>
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
      <el-table-column label="资产" align="center" prop="marketAccBalance" />
      <el-table-column label="有效邀请人数" align="center" prop="inviteEffNum">
        <template slot-scope="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="toUserInfo(scope.row, 3)"
          >{{ scope.row.inviteEffNum }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="贡献交易金额" align="center" prop="txnAmt" />
      <el-table-column label="贡献手续费" align="center" prop="txnFee" />
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
import { levelList } from '@/api/marketgrant/marketLevel'
import { sortList } from '@/api/marketgrant/makerDaily'

export default {
  name: 'MarketRanking',
  data() {
    return {
      // 排序规则
      ruleOptions: [
        {
          col: 'marketAccBalance',
          colName: '按资产排名'
        },
        {
          col: 'inviteEffNum',
          colName: '按有效邀请人数排名'
        },
        {
          col: 'txnAmt',
          colName: '按贡献交易金额排名'
        },
        {
          col: 'txnFee',
          colName: '按贡献手续费排名'
        },
        {
          col: 'marketProfitAmt',
          colName: '按做市收益排名'
        },
        {
          col: 'platformProfitAmt',
          colName: '按为平台创造收益排名'
        }
      ],
      loading: true,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        levelId: undefined,
        rankingRule: 'marketAccBalance'
      },
      total: 0,
      tableList: [],
      levelIdOptions: []
    }
  },
  created() {
    this.getMarLevelList()
    this.getList()
  },
  methods: {
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
    getList() {
      this.loading = true
      sortList(this.queryParams).then((response) => {
        this.tableList = response.rows
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        levelId: undefined,
        rankingRule: 'marketAccBalance'
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
        case 2:
          // 跳用户详情
          sessionStorage.setItem('uid', row.uid)
          this.$nextTick(() => {
            this.$router.replace({
              path: '/redirect/lookInfo2/index'
            })
          })
          break
        case 3:
          // 跳邀请列表
          this.$router.push({
            name: 'userinvitationlist',
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
