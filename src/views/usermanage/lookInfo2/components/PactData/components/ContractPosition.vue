<template>
  <div style="padding-bottom: 20px">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item label="合约" prop="symbol">
        <el-select
          v-model="queryParams.contractId"
          size="mini"
          filterable
          clearable
        >
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="(item,index) in contractOptions"
            :key="index"
            :label="item.displayName"
            :value="item.displayName"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="load()">查询</el-button>
        </el-form-item> -->
      <el-form-item label prop="symbol">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" border :data="cryptoListFilter">
      <el-table-column label="合约名称" align="center" prop="symbol">
        <template slot-scope="scope">
          <span>{{ scope.row.symbol }}</span>
        </template>
      </el-table-column>
      <el-table-column label="持仓量" align="center" prop="posiQty">
        <template slot-scope="scope">
          <span>{{ scope.row.posiQty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开仓价格" align="center" prop="openPrice" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.openPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="初始保证金" align="center" prop="initMargin" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.initMargin }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金类型" align="center" prop="marginType">
        <template slot-scope="scope">
          <span v-if="scope.row.marginType==1">全仓</span>
          <span v-if="scope.row.marginType==2">逐仓</span>
        </template>
      </el-table-column>
      <el-table-column label="杠杆倍数" align="center" prop="leverage">
        <template slot-scope="scope">
          <span>{{ scope.row.leverage }}</span>
        </template>
      </el-table-column>
      <el-table-column label="未实现盈亏" align="center" prop="unRealizedProfit">
        <template slot-scope="scope">
          <span>{{ scope.row.unRealizedProfit }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="收益率" align="center" prop="----">
        <template slot-scope="scope">
          <span></span>
        </template>
      </el-table-column>
      <el-table-column label="风险率" align="center" prop="----">
        <template slot-scope="scope">
          <span></span>
        </template>
      </el-table-column> -->
      <el-table-column label="强平价格" align="center" prop="liquidationPrice">
        <template slot-scope="scope">
          <span>{{ scope.row.liquidationPrice }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <!-- <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="load"
      />
    </div> -->
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getUserPositionList } from '@/api/userinfo/userInfo'
import { exportUserPositionRecord } from '@/api/launchpad'
export default {
  name: 'ContractRecord',
  props: ['msg', 'contractOptions'],
  data() {
    return {
      loading: true,
      // 查询参数
      queryParams: {
        'pageNum': 1,
        'pageSize': 10,
        'userShortId': sessionStorage.getItem('userId'),
        'contractId': undefined
      },
      cryptoList: [],
      total: 0
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList']),
    cryptoListFilter() {
      return this.cryptoList.filter(item => item.symbol === this.queryParams.contractId || !this.queryParams.contractId)
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      getUserPositionList({ userShortId: sessionStorage.getItem('userId') })
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
    /** 导出按钮操作 */
    handleExport() {
      // const queryParams = this.queryParams
      this.$confirm('是否确认导出指定用户列表数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportUserPositionRecord({ userShortId: sessionStorage.getItem('userId') })
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
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
