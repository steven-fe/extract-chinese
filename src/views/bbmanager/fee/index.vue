<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="id" />
      <el-table-column prop="configDesc" label="描述" />
      <el-table-column prop="configGroup" label="分组" />
      <el-table-column prop="configKey" label="configKey" />
      <el-table-column prop="configValue" label="值" />
      <el-table-column prop="createDate" label="创建时间" />
      <el-table-column :label="$t('common.operation')" width="160">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
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
    <el-dialog title="常量管理" :visible.sync="dialogFormVisible">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item label="描述" :label-width="formLabelWidth">
          <el-input v-model="form.configDesc" />
        </el-form-item>
        <el-form-item label="分组" :label-width="formLabelWidth">
          <el-input v-model="form.configGroup" />
        </el-form-item>
        <el-form-item label="key" :label-width="formLabelWidth">
          <el-input v-model="form.configKey" />
        </el-form-item>
        <el-form-item label="数值" :label-width="formLabelWidth">
          <el-input v-model="form.configValue" />
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
import { edit, findList } from '@/api/user'

export default {
  data() {
    return {
      dialogFormVisible: false,
      radio: '1',
      status: '',
      form: {
        configDesc: '',
        configGroup: '',
        configKey: '',
        configValue: '',
        id: ''
      },
      pageSize: 10,
      pageNum: 1,
      total: 0,
      loading: true,
      pageShow: true,
      realName: '',
      tableData: [],
      formLabelWidth: '140px'
    }
  },
  created() {
    this.load()
  },
  methods: {
    handleEditTure() {
      for (const key in this.form) {
        if (this.form[key].length == 0) {
          this.$message({
            showClose: true,
            message: '请填写全部信息',
            type: 'error'
          })
          return
        }
      }
      edit(this.form)
        .then(response => {
          this.$message({
            showClose: true,
            message: '修改成功',
            type: 'success'
          })
          this.dialogFormVisible = false
          this.load()
        })
        .catch(error => {
          console.log(error)
        })
    },
    handleEdit(row, index) {
      this.form = {
        configDesc: index.configDesc + '',
        configGroup: index.configGroup + '',
        configKey: index.configKey + '',
        configValue: index.configValue + '',
        id: index.id + ''
      }
      this.dialogFormVisible = true
    },
    // 加载
    load() {
      this.loading = true
      const data = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      findList(data)
        .then(response => {
          console.log(response)
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
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
