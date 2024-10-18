<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20" />
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="openAdd">添加模板</el-button>

    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="id" align="center" />
      <el-table-column prop="language" label="语言" align="center" />
      <el-table-column prop="template" label="模板内容" align="center" />
      <el-table-column label="创建时间" align="center" prop="create_time" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="openUpdate(scope.row.id)">修改</el-button>
          <el-button type="danger" size="mini" @click="del(scope.row.id)">删除</el-button>
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
    <el-dialog title="添加模板" :visible.sync="open" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form ref="digForm" :model="digForm" :rules="rules">
        <div class="form-grid">
          <el-form-item style="margin-left: 5%; width: 90%;" label="模板内容:" prop="template">
            <el-input v-model="digForm.template" type="textarea" placeholder="模板内容" clearable />
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="save">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addVerifyTemplate, delVerifyTemplate, getVerifyTemplateList, updateVerifyTemplate } from '@/api/auditTemplate/auditTemplate.js'

export default {
  filters: {

  },
  data() {
    return {
      verifyTemplateId: '',
      open: false,
      digForm: {
        template: ''
      },
      rules: {
        template: [
          { required: true, message: '请添加模板', trigger: 'change' }
        ]
      },
      loading: true,
      pageNum: 1,
      pageSize: 10,
      tableData: [],
      total: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    del(id) {
      const data = {}
      data.id = id
      delVerifyTemplate(data).then(response => {
        if (response.code == 200) {
          this.msgSuccess('删除成功')
          this.load()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    openUpdate: function(id) {
      this.digForm.template = this.tableData.filter(p => p.id == id)[0].template
      this.verifyTemplateId = id
      this.digForm.id = id
      this.open = true
    },
    // 保存模板
    save() {
      this.$refs['digForm'].validate(valid => {
        if (valid) {
          if (this.verifyTemplateId == -1) {
            addVerifyTemplate(this.digForm).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.load()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
              this.open = false
            })
          } else {
            updateVerifyTemplate(this.digForm).then(response => {
              if (response.code == 200) {
                this.msgSuccess('修改')
                this.load()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
              this.open = false
            })
          }
        }
      })
    },
    openAdd() {
      this.verifyTemplateId = -1
      this.digForm.template = ''
      this.open = true
    },
    cancel() {
      this.open = false
    },
    load() {
      this.loading = true
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      getVerifyTemplateList(formData)
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
<style scoped>

</style>
