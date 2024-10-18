<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="5">
        <div class="grid-content bg-purple">
          <el-button type="primary" icon="el-icon-edit" @click="addHandle()">添加</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="id" />
      <el-table-column prop="symbol" label="交易对" />
      <el-table-column prop="t1" label="t1" />
      <el-table-column prop="t2" label="t2" />
      <el-table-column :label="$t('common.operation')" width="160">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
    <el-dialog title="OTC管理" :visible.sync="dialogFormVisible">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item label="t1" :label-width="formLabelWidth">
          <el-input v-model="form.t1" />
        </el-form-item>
        <el-form-item label="t2" :label-width="formLabelWidth">
          <el-input v-model="form.t2" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listBbTokens, addBbTokens, delBbTokens } from '@/api/otc'

export default {
  data() {
    return {
      loading: true,
      pageShow: true,
      dialogFormVisible: false,
      rebateType: '',
      form: {
        t1: '',
        t2: ''
      },
      change: {},
      title: '',
      tableData: [],
      status: '',
      pageSize: 10,
      pageNum: 1,
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
      // 去空值
      const data = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      listBbTokens(data)
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
    addHandle() {
      (this.form = {
        t1: '',
        t2: ''
      }),
      (this.status = true)
      this.dialogFormVisible = true
    },
    handleEditTure() {
      addBbTokens(this.form)
        .then(response => {
          this.$message({
            showClose: true,
            message: '添加成功',
            type: 'success'
          })
          this.dialogFormVisible = false
          this.load()
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 删除
    handleDelete(row, index) {
      this.$confirm('确定删除, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          delBbTokens({ id: index.id })
            .then(response => {
              this.$message({
                showClose: true,
                message: '删除成功',
                type: 'success'
              })
              this.load()
            })
            .catch(error => {
              this.$message({
                showClose: true,
                message: '删除失败',
                type: 'error'
              })
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
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
