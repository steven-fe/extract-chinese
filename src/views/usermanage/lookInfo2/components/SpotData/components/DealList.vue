<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="币对" prop="symbol">
        <el-select
          v-model="queryParams.instrumentId"
          size="mini"
          filterable
          clearable
          placeholder="请选择币对"
        >
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="(item,index) in pairList"
            :key="index"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单号">
        <el-input v-model="queryParams.orderId" size="mini" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="交易方向" prop="side">
        <el-select v-model="queryParams.side" placeholder="请选择交易方向" size="mini">
          <el-option
            v-for="item in sides"
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
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="币对" align="center" prop="instrumentName" />
      <el-table-column label="订单ID" align="center" prop="orderId" width="180" />
      <el-table-column label="UID" align="center" prop="userId" width="120" />
      <el-table-column label="交易方向" align="center" prop="side" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.side === -1">卖出</span>
          <span v-if="scope.row.side === 1">买入</span>
        </template>
      </el-table-column>
      <el-table-column label="成交价" align="center" prop="execPriceMsg" />
      <el-table-column label="成交量" align="center" prop="execQtyMsg" />
      <el-table-column label="成交金额" align="center" prop="execAmtMsg" />
      <el-table-column label="手续费" align="center" prop="feeMsg" />
      <el-table-column label="实际手续费费率" align="center" prop="acturalFeeRateMsg" />
      <el-table-column label="成交时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.matchTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="taker Or maker" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.role === 1 ? 'taker' : 'maker' }}</span>
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
import { userMatchList } from '@/api/userinfo/userInfo'
export default {
  name: 'OrderList',
  props: ['msg'],
  data() {
    return {
      loading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderId: undefined,
        instrumentId: undefined,
        userId: this.msg,
        side: ''
      },
      cryptoList: [],
      total: 0,
      sides: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '买入'
        },
        {
          value: '-1',
          label: '卖出'
        }
      ]
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList'])
  },
  created() {
    this.load()
    this.getPair()
  },
  methods: {
    ...mapActions('systemsetting', ['getPair']),
    // 加载
    load() {
      this.loading = true
      userMatchList(this.queryParams)
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
