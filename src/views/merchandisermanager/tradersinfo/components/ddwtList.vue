<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column prop="followOrderId" align="center" label="委托ID" />
      <el-table-column prop="followOrderStatus" align="center" label="委托状态">
        <template slot-scope="scope">
          <span v-if="scope.row.followOrderStatus=='1'">持仓</span>
          <span v-if="scope.row.followOrderStatus=='2'">卖出</span>
          <span v-if="scope.row.followOrderStatus=='3'">爆仓</span>
          <span v-if="scope.row.followOrderStatus=='4'">已交割</span>
          <span v-if="scope.row.followOrderStatus=='5'">无效</span>
        </template>
      </el-table-column>

      <el-table-column prop="currency" align="center" label="委托币种" />
      <el-table-column prop="settlementProfitAmount" align="center" label="委托总收益" />
      <el-table-column prop="created" align="center" label="委托带单时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.created) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="load"
      />
    </div>
  </div>
</template>

<script>
import { findGuiderOrderTotal } from '@/api/system/guides'
export default {
  props: ['msg'],
  data() {
    return {
      tableData: [],
      loading: true,
      total: 0,
      pageNum: 1,
      pageSize: 10,
      guideId: this.msg
    }
  },
  created() {
    this.load()
  },

  methods: {
    load() {
      if (!this.guideId) {
        return
      }
      this.loading = true
      findGuiderOrderTotal({ guideId: this.guideId })
        .then(response => {
          if (response.code == 200) {
            this.tableData = response.rows
          } else {
            this.tableData = []
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

<style scoped>
</style>
