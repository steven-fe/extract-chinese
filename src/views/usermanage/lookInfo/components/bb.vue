<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="usable_amount" label="可用" />
      <el-table-column prop="frost_amount" label="冻结" />
      <el-table-column prop="lock_amount" label="锁仓" />
      <el-table-column prop="lock_released_amount" label="已释放" />
      <el-table-column prop="currency" :label="$t('common.coin')" />
      <el-table-column prop="platform" label="平台" />
      <el-table-column :label="$t('common.operation')" width="300">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row,true)">修改可用</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleEdit(scope.$index, scope.row,false)"
          >修改锁仓</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="修改金额" :visible.sync="dialogFormVisible">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item label="数量" :label-width="formLabelWidth">
          <el-input v-model="form.amount" />
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
import { getBbAccount } from '@/api/user'
import { updateUsableAmount, updateLockAmount } from '@/api/otc'
import { getToken } from '@/utils/auth'

export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      status: true,
      dialogFormVisible: false,
      userId: this.msg,
      // 日期快捷选项
      currency: '',
      form: {
        amount: '',
        currency: ''
      },
      tableData: [],
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
        userId: this.userId
      }
      if (!this.userId) {
        return
      }
      getBbAccount(formData)
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
    },
    handleEdit(row, index, br) {
      this.status = br
      for (const list in index) {
        this.form[list] = index[list]
      }
      this.form.amount = ''
      this.dialogFormVisible = true
    },
    handleEditTure() {
      const formData = {
        amount: this.form.amount,
        currency: this.form.currency,
        userId: this.userId
      }
      if (this.status) {
        updateUsableAmount(formData)
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
      } else {
        updateLockAmount(formData)
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
