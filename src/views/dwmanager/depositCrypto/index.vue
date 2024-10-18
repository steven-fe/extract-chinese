<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item :label="$t('common.coin')" prop="name">
        <el-select
          v-model="queryParams.symbol"
          size="mini"
          filterable
          clearable
          placeholder="请选择币种"
        >
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="(item,index) in coinList"
            :key="index"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="登录账号" prop="account">
        <el-input
          v-model="queryParams.account"
          placeholder="请输入登录账号"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户id"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充值时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="TXID" prop="txid">
        <el-input
          v-model="queryParams.txid"
          placeholder="TXID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充值状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择充值状态" size="mini">
          <el-option
            v-for="item in statuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上账地址" prop="addressTo">
        <el-input
          v-model="queryParams.addressTo"
          placeholder="请输入上账地址"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="充币类型" prop="internalType">
        <el-select v-model="queryParams.internalType" placeholder="请选择充币类型" size="mini">
          <el-option
            v-for="item in internalTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="cryptoList">
      <el-table-column :label="$t('common.operation')" align="center" min-width="200">
        <template slot-scope="scope">
          <el-button v-if="(!scope.row.claimUserId && scope.row.status === 0 && scope.row.claimType === 1) || (!scope.row.claimUserId && scope.row.status === 0 && scope.row.claimType === 2)" type="primary" size="mini" @click="handleChangeClaim(scope.row, 1)">认领</el-button>
          <el-button v-if="scope.row.claimUserId && scope.row.operatorFlag" type="danger" size="mini" @click="handleChangeClaim(scope.row, 0)">取消认领</el-button>
          <el-button v-if="scope.row.claimUserId && !scope.row.operatorFlag" type="info" size="mini" disabled>已被认领</el-button>
          <el-button type="warning" size="mini" @click="openDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
      <el-table-column label="充值id" align="center" prop="id" min-width="100" />
      <el-table-column :label="$t('dwmanager.userUID')" align="center" min-width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.userId">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.userId }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="登录账号" align="center" min-width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.account">{{ scope.row.account }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" min-width="100" />
      <el-table-column label="链名称" align="center" prop="chainName" min-width="100" />
      <el-table-column label="充值时间" align="center" prop="createdAt" min-width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额" align="center" prop="amount" min-width="200" />
      <el-table-column label="入账账户" align="center" prop="lockAccount" :formatter="({ lockAccount }) => lockAccounts.mapByValue.get(+lockAccount).label" min-width="200" />
      <el-table-column label="TXID" align="center" prop="txid" min-width="280" />
      <el-table-column label="上账地址" align="center" prop="addressTo" min-width="280" />
      <el-table-column label="充值状态" align="center" prop="status" min-width="200">
        <template slot-scope="scope">
          <span v-for="(item, index) in tablestatuses" :key="index">
            <span v-if="scope.row.status==item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="未到账原因" align="center" min-width="200">
        <template slot-scope="scope">
          <span v-for="(item, index) in claimTypeOptions" :key="index">
            <span v-if="scope.row.claimType === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="认领人" align="center" prop="claimUserName" min-width="200" />
      <el-table-column label="充币类型" align="center" prop="internalType" min-width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.internalType === 0">链上充币</span>
          <span v-if="scope.row.internalType === 1">站内充币</span>
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
    <el-dialog title="详情" :visible.sync="open" width="450px">
      <div :class="$style.dialog">用户UID： {{ userId || '--' }}</div>
      <div :class="$style.dialog">充值币种： {{ symbol }}</div>
      <div :class="$style.dialog">链名称： {{ chainName }}</div>
      <div :class="$style.dialog">TXID： {{ txid }}</div>
      <div :class="$style.dialog">时间： {{ parseTime(createdAt) }}</div>
      <div :class="$style.dialog">充值金额： {{ amount }}</div>
      <div :class="$style.dialog">充值地址： {{ addressTo }}</div>
      <div :class="$style.dialog">未到账原因： {{ claimType }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="open = false">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { listCrypto, exportCrypto, changeClaimStatus } from '@/api/finance/depositCrypto'
import { lockAccounts } from '@/config'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 区块链资产充值流水记录表格数据
      cryptoList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: undefined,
        userId: undefined,
        account: undefined,
        symbol: '',
        createdAt: undefined,
        txid: undefined,
        addressTo: undefined,
        beginTime: undefined,
        endTime: undefined,
        internalType: ''
      },
      userId: '',
      symbol: '',
      chainName: '',
      txid: '',
      createdAt: '',
      amount: '',
      addressTo: '',
      claimType: '',
      statuses: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '0',
          label: '未确认'
        },
        {
          value: '1',
          label: '已完成'
        },
        {
          value: '2',
          label: '异常'
        }
      ],
      internalTypes: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '0',
          label: '链上充币'
        },
        {
          value: '1',
          label: '站内充币'
        }
      ],
      tablestatuses: [
        {
          value: '0',
          label: '未确认'
        },
        {
          value: '1',
          label: '已完成'
        },
        {
          value: '2',
          label: '异常'
        }
      ],
      claimTypeOptions: [
        { value: null, label: '--' },
        { value: 0, label: '未达到最小充值金额' },
        { value: 1, label: 'Tag/Memo错误' },
        { value: 2, label: '充值关闭' },
        { value: 3, label: '未达到充值确认数' }
      ],
      lockAccounts: Object.freeze(lockAccounts)
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    coinList() {
      return this.currencyList
    }
  },
  created() {
    this.getList()
    this.getCurrency(1)
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    /** 查询区块链资产充值流水记录列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listCrypto(this.queryParams).then(response => {
        this.cryptoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 详情
    openDetail(row) {
      this.open = true
      this.userId = row.userId
      this.symbol = row.symbol
      this.chainName = row.chainName
      this.txid = row.txid
      this.createdAt = row.createdAt
      this.amount = row.amount
      this.addressTo = row.addressTo
      this.claimTypeOptions.map(item => {
        if (item.value === row.claimType) {
          this.claimType = item.label
        }
      })
    },
    handleChangeClaim(row, status) {
      const params = {
        id: row.id,
        claimStatus: status
      }
      changeClaimStatus(params).then(res => {
        status === 1 ? this.msgSuccess('认领成功') : this.msgSuccess('取消认领成功')
        this.getList()
      })
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有区块链资产充值流水记录数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportCrypto(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
<style lang="scss" module>
.dialog {
  font-size: 16px;
  margin-bottom: 15px;
}
</style>
