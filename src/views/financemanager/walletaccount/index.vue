<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item :label="$t('common.accountType')" prop="userId">
        <el-select
          v-model="queryParams.userId"
          size="mini"
          placeholder="请选择账户类型"
        >
          <el-option
            v-for="(item, index) in typeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currency">
        <el-select
          v-model="queryParams.currency"
          clearable
          size="mini"
          placeholder="请选择币种"
        >
          <el-option
            v-for="(item, index) in coinList"
            :key="index"
            :label="item.currency"
            :value="item.currency"
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

    <el-table v-loading="loading" :data="accountList" border>
      <el-table-column label="账号ID" align="center" prop="user_id" />
      <el-table-column label="账号类型" align="center" width="150">
        <template slot-scope="scope">
          <span v-for="(item, index) in typeList" :key="index">
            <span v-if="item.value == scope.row.user_id">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可用余额" align="center" prop="usable_amount" />
      <el-table-column label="冻结余额" align="center" prop="frost_amount" />
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column label="平台" align="center" prop="platform" />
      <el-table-column label="是否可用" align="center" prop="enable">
        <template slot-scope="scope">
          <span v-if="scope.row.enable == 1">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
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
import { listAccount } from '@/api/assets'
import { listSupportTokenByType } from '@/api/coin'

export default {
  name: 'WalletAccount',
  data() {
    return {
      // 币种列表
      coinList: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 【请填写功能名称】表格数据
      accountList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: '1, 4, 6, 8',
        currency: undefined
      },
      typeList: [
        { value: '1, 4, 6, 8', label: this.$t('common.all') },
        { value: 1, label: '划转账户' },
        { value: 4, label: '提币手续费账户' },
        { value: 6, label: '营销账户' },
        { value: 8, label: 'TUSDT兑换账户' }
      ]
    }
  },
  created() {
    this.getCoinList()
    this.getList()
  },
  methods: {
    // 商品id列表
    getCoinList() {
      listSupportTokenByType().then((response) => {
        if (response.code == 200) {
          this.coinList = response.rows
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true
      listAccount(this.queryParams).then((response) => {
        this.accountList = response.rows
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
    }
  }
}
</script>
