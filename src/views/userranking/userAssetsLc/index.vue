<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="userRealName" label="真实姓名" />
      <el-table-column prop="userPhone" label="手机号" />
      <el-table-column prop="amount" label="释放数量" />
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
import { getBbReleaseRecordTop } from '@/api/otc'

export default {
  data() {
    return {
      dialogFormVisible: false,
      loading: true,
      pageShow: true,
      // 币种下拉
      realName: '',
      currency: '',
      phone: '',
      startDate: '',
      endDate: '',
      pageSize: 10,
      pageNum: 1,
      tableData: [],
      total: 0,
      formLabelWidth: '140px'
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
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        sort: 'desc'
      }

      getBbReleaseRecordTop(formData)
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
    },
    // 索引值
    indexMethod(index) {
      return index + (this.pageNum - 1) * this.pageSize + 1
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
