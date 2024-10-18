<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData">
      <el-table-column align="center" prop="guideOrderId" label="委托ID" />
      <el-table-column align="center" prop="userId" label="用户ID" />
      <el-table-column align="center" prop="currency" label="委托币种" />
      <el-table-column align="center" prop="frozenAmount" label="收益" />
      <el-table-column align="center" prop="created" label="委托带单时间">
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
import { selectFollowOrderList } from '@/api/system/guides'
export default {
  props: ['msg'],
  data() {
    return {
      tableData: [],
      loading: false,
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
      this.loading = true
      if (!this.guideId) {
        return
      }
      selectFollowOrderList({ guideId: this.guideId })
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
