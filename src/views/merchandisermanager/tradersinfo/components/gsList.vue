<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData">
      <el-table-column align="center" prop="userId" label="用户ID" />
      <el-table-column align="center" prop="currency" label="跟随币种" />
      <el-table-column align="center" prop="totalProfit" label="跟随收益" />
      <el-table-column align="center" prop="totalAmount" label="累计跟随本金" />
      <el-table-column align="center" prop="followStatus" label="跟随状态">
        <template slot-scope="scope">
          <span v-if="scope.row.followStatus=='1'">开启</span>
          <span v-if="scope.row.followStatus=='2'">关闭</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created" label="起始跟随时间">
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
import { findFollowTraders } from '@/api/system/guides'
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
      findFollowTraders({ guideId: this.guideId })
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
