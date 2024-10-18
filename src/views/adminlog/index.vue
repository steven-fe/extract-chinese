<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">

      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="id" placeholder="模糊查询" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table
      v-loading="loading"
      border
      class="top"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        type="index"
        label="序号"
        :index="indexMethod"
      />
      <el-table-column
        prop="id"
        label="ID"
      />
      <el-table-column
        prop="operation_log"
        label="操作内容"
      />
      <el-table-column
        prop="adminid"
        label="操作人id"
      />
      <el-table-column
        prop="operating_time"
        label="时间"
      />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <el-pagination
        background
        :hide-on-single-page="pageShow"
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { listAdminLog } from '@/api/user'

export default {
  data() {
    return {
      loading: true,
      pageShow: true,
      startDate: '',
      endDate: '',
      pageSize: 10,
      pageNo: 1,
      id: '',
      tableData: [],
      pageTotal: 0
    }
  },
  watch: {
    // 深度监听条数变化，判断页码显隐
    pageTotal: function() {
      if (this.pageTotal <= this.pageSize) {
        this.pageShow = true
      } else {
        this.pageShow = false
      }
    },
    deep: true
  },
  created() {
    this.load()
  },
  methods: {

    // 加载
    load() {
      this.loading = true
      const formData = {
        'like': this.id,
        'pageNum': this.pageNo,
        'pageSize': this.pageSize
      }

      listAdminLog(formData).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.tableData = []
          this.total = 0
          this.msgError(response.msg)
        }
        this.loading = false
      }).catch(error => {
        console.log(error)
      })
    },
    // 改变每页显示条数
    handleSizeChange(val) {
      this.pageSize = val
      this.load()
    },
    // 改变页码
    handleCurrentChange(val) {
      this.pageNo = val
      this.load()
    },
    // 索引值
    indexMethod(index) {
      return index + (this.pageNo - 1) * this.pageSize + 1
    }
  }
}
</script>
<style scoped>
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
  }

  .top {
    margin-top: 20px;
  }
</style>
