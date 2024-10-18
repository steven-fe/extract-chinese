<template>
  <div class="app-container">
    <!--form-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="avg_pay_time" label="平均支付时间" />
      <el-table-column prop="avg_put_time" label="平均放币时间" />
      <el-table-column prop="total_times" label="交易总次数" />
      <el-table-column prop="finish_times" label="成交次数" />
      <el-table-column prop="outtime_times" label="超时次数" />
      <el-table-column prop="praise_count" label="好评次数" />
      <el-table-column prop="bad_count" label="差评次数" />
      <el-table-column prop="finish_rate" label="完成率" />
      <el-table-column prop="status" label="用户场外交易状态">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1">正常</span>
          <span v-if="scope.row.status == 2">冻结</span>
          <span v-if="scope.row.status == 3">异常</span>
          <span v-if="scope.row.status == 4">黑名单</span>
        </template>
      </el-table-column>
      <el-table-column prop="extral" :label="$t('common.remarks')" />
    </el-table>
    <!--分页组件-->
  </div>
</template>

<script>
import { getTradeCredit } from '@/api/user'
export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      userId: this.msg,

      tableData: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      const formData = {
        userId: this.userId
      }
      getTradeCredit(formData)
        .then(response => {
          if (response.code == 200) {
            this.tableData = []
            if (response.data) {
              this.tableData.push(response.data)
            }
            this.total = response.total
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
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
