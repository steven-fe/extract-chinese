<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <el-table-column prop="buyerId" label="买家ID" />
      <el-table-column prop="sellerId" label="卖家ID" />
      <el-table-column prop="buyOrderId" label="买单ID" />
      <el-table-column prop="sellOrderId" label="卖单ID" />
      <el-table-column prop="t1" label="t1" />
      <el-table-column prop="t2" label="t2" />
      <el-table-column prop="buyPrice" label="买家价格" />
      <el-table-column prop="sellPrice" label="卖家价格" />
      <el-table-column prop="dealPrice" label="成交价格" />
      <el-table-column prop="amount" label="成交数量" />
      <el-table-column prop="lock_released_amount" label="释放数量" />

      <el-table-column prop="createTime" label="时间" />
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
import { getBbReleaseRecord } from '@/api/user'
export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      userId: this.msg,
      pageShow: true,
      // 日期快捷选项
      realName: '',
      currency: '',
      status: '',
      pageSize: 10,
      pageNum: 1,
      tableData: [],
      total: 0
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
        userId: this.userId
      }
      getBbReleaseRecord(formData)
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
    },
    // 日期处理
    formatDate(time) {
      if (time) {
        const date = new Date(time)
        const year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        if (month < 10) {
          month = '0' + month
        }
        if (day < 10) {
          day = '0' + day
        }
        return year + '-' + month + '-' + day
      } else {
        return ''
      }
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
