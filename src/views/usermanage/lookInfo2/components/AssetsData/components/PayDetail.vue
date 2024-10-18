<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item :label="$t('common.coin')" prop="symbol">
        <el-select
          v-model="queryParams.symbol"
          size="mini"
          filterable
          clearable
          placeholder="请选择币种"
        >
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="(item,index) in currencyList"
            :key="index"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="symbol">
        <el-select v-model="queryParams.status" size="mini" clearable placeholder="请选择状态">
          <el-option
            v-for="item in statuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
      <el-form-item label prop="symbol">
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <el-table v-loading="loading" border :data="cryptoList">
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" />
      <el-table-column label="链名称" align="center" prop="chainName" />
      <el-table-column label="充值时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额" align="center" prop="amount" />
      <el-table-column label="入账账户" align="center" prop="lockAccount" :formatter="({ lockAccount }) => lockAccounts.mapByValue.get(+lockAccount).label" />
      <el-table-column label="TXID" align="center" prop="txid" width="280" />
      <el-table-column label="上账地址" align="center" prop="addressTo" />
      <el-table-column label="充值状态" align="center" prop="status">
        <template slot-scope="scope">
          <span v-for="(item, index) in tablestatuses" :key="index">
            <span v-if="scope.row.status==item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="充币类型" align="center" prop="internalType" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.internalType === 0">链上充币</span>
          <span v-if="scope.row.internalType === 1">站内充币</span>
        </template>
      </el-table-column>
      <el-table-column label="未到账原因" align="center" prop="noDepositMsg" />
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
import { mapState, mapActions } from 'vuex'
import { listCrypto } from '@/api/finance/depositCrypto'
import { lockAccounts } from '@/config'

export default {
  name: 'PayDetail',
  props: ['msg'],
  data() {
    return {
      loading: true,
      statuses: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '0',
          label: '未到账'
        },
        {
          value: '1',
          label: '已完成'
        },
        {
          value: '2',
          label: '异常'
        },
        {
          value: '3',
          label: '审核中'
        },
        {
          value: '4',
          label: '驳回'
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
          label: '未到账'
        },
        {
          value: '1',
          label: '已完成'
        },
        {
          value: '2',
          label: '异常'
        },
        {
          value: '3',
          label: '审核中'
        },
        {
          value: '4',
          label: '驳回'
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: undefined,
        uid: this.msg,
        symbol: undefined,
        internalType: ''
      },
      cryptoList: [],
      total: 0,
      lockAccounts: Object.freeze(lockAccounts)
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList'])
  },
  created() {
    this.load()
    this.getCurrency()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 加载
    load() {
      this.loading = true
      this.queryParams.symbol =
        this.queryParams.symbol === '全部' ? '' : this.queryParams.symbol
      listCrypto(this.queryParams)
        .then(response => {
          if (response.code === 200) {
            this.cryptoList = response.rows
            this.total = response.total
          } else {
            this.cryptoList = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 索引值
    indexMethod(index) {
      return index + (this.pageNum - 1) * this.pageSize + 1
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
