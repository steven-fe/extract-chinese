<template>
  <div class="app-container">
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column prop="symbol" :label="$t('common.coin')" />
      <el-table-column prop="address" label="充值地址" />
      <el-table-column prop="status" :label="$t('common.status')">
        <template slot-scope="scope">
          <span v-if="scope.row.status==0">不可用</span>
          <span v-if="scope.row.status==1">可用</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          {{ parseTime(scope.row.ctime) }}
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="form.pageNum"
      :limit.sync="form.pageSize"
      @pagination="load"
    />
  </div>
</template>

<script>
import { listAddr } from '@/api/finance/addr'
export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      tableData: [],
      form: {
        uid: this.msg,
        pageSize: 10,
        pageNum: 1
      },
      total: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      listAddr(this.form)
        .then(response => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.total = response.total
          } else {
            this.tableData = []
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

