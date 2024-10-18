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
      <el-form-item label prop="symbol">
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <el-table v-loading="loading" :data="cryptoList" border>
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" />
      <el-table-column label="链名称" align="center" prop="chainName" />
      <el-table-column label="提现时间" align="center" prop="createdAt">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" align="center" prop="payTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.payTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上链时间" align="center" prop="upTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.upTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提现金额" align="center" prop="amount" />
      <el-table-column label="手续费" align="center" prop="fee" />
      <el-table-column label="到账地址" align="center" prop="addressTo" />
      <el-table-column label="TXID" align="center" prop="txid" />
      <el-table-column label="提现状态" align="center" prop="status">
        <template slot-scope="scope">
          <span v-for="(item, index) in tablestatuses" :key="index">
            <span v-if="scope.row.status==item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
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
import { listCrypto } from '@/api/finance/withdrawcrypto'
export default {
  name: 'ExtractDetail',
  props: ['msg', 'userId', 'uid'],
  data() {
    return {
      // 遮罩层
      loading: true,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: this.msg,
        symbol: undefined,
        status: undefined
      },
      coinList: [{ currency: '全部' }],
      statuses: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 0,
          label: '未审核'
        },
        {
          value: 7,
          label: '待财务审核'
        },
        {
          value: 1,
          label: '审核通过'
        },
        {
          value: 8,
          label: '财务审核通过'
        },
        {
          value: 2,
          label: '审核拒绝'
        },
        {
          value: 9,
          label: '财务审核拒绝'
        },
        {
          value: 3,
          label: '支付中'
        },
        {
          value: 4,
          label: '支付失败'
        },
        {
          value: 5,
          label: '已完成'
        },
        {
          value: 6,
          label: '已撤销'
        }
      ],
      tablestatuses: [
        {
          value: 0,
          label: '未审核'
        },
        {
          value: 1,
          label: '审核通过'
        },
        {
          value: 2,
          label: '审核拒绝'
        },
        {
          value: 3,
          label: '支付中'
        },
        {
          value: 4,
          label: '支付失败'
        },
        {
          value: 5,
          label: '已完成'
        },
        {
          value: 6,
          label: '已撤销'
        },
        {
          value: 7,
          label: '待财务审核'
        },
        {
          value: 8,
          label: '财务审核通过'
        },
        {
          value: 9,
          label: '财务审核拒绝'
        }
      ],
      cryptoList: [],
      total: 0,
      formLabelWidth: '140px'
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList'])
  },
  created() {
    this.load()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 加载
    load() {
      this.loading = true
      this.queryParams.symbol =
        this.queryParams.symbol === '全部' ? '' : this.queryParams.symbol
      listCrypto(this.queryParams).then(response => {
        this.cryptoList = response.rows
        this.total = response.total
        this.loading = false
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
