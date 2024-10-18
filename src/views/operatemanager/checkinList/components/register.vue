<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="userId " size="mini" clearable placeholder="请输入用户id" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" />
      <el-table-column prop="userId" label="用户id" />
      <el-table-column prop="userRealName" label="姓名" />
      <el-table-column prop="userEmail" label="邮箱号" />
      <el-table-column prop="userPhone" label="手机号" />
      <el-table-column label="奖励">
        <template slot-scope="scope">{{ scope.row.amount+scope.row.currency }}</template>
      </el-table-column>
      <el-table-column prop="ctime" label="注册时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
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
import { listCheckin } from '@/api/coin'

export default {
  data() {
    return {
      loading: true,
      userId: '',
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
        type: 'register',
        userId: this.userId + ''
      }

      listCheckin(formData)
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
