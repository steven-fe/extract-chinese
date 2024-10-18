<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="1.5">
        <div class="bg-purple">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="addHandle()">添加</el-button>
        </div>
      </el-col>
      <el-col :xs="12" :span="1.5">
        <div class="grid-content bg-purple">
          <el-button type="success" icon="el-icon-edit" size="mini" @click="setOtcfee()">手续费设置</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="currency" :label="$t('common.coin')" />
      <el-table-column prop="platform" label="平台" />
      <el-table-column prop="minprice" label="挂单最小金额" />
      <el-table-column prop="maxprice" label="挂单最大金额" />
      <el-table-column :label="$t('common.operation')" width="160">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="OTC管理" :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="rules" class="demo-form-inline">
        <el-form-item :label="$t('common.coin')" :label-width="formLabelWidth" prop="currency">
          <el-input v-model="form.currency" clearable />
        </el-form-item>
        <el-form-item label="平台" :label-width="formLabelWidth" prop="platform">
          <el-input v-model="form.platform" clearable />
        </el-form-item>
        <el-form-item label="挂单最小金额" :label-width="formLabelWidth" prop="minprice">
          <el-input v-model="form.minprice" clearable />
        </el-form-item>
        <el-form-item label="挂单最大金额" :label-width="formLabelWidth" prop="maxprice">
          <el-input v-model="form.maxprice" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="手续费设置" :visible.sync="feeSetDialog">
      <el-tabs v-model="activeName" v-loading="feeloading" type="card" @tab-click="handleClick">
        <el-tab-pane
          v-for="(item,index) in otcFeeList"
          :key="index"
          :label="item.currency"
          :name="item.currency"
        >
          <el-form :model="feeform" :rules="feeRules" :inline="true" class="demo-form-inline">
            <el-form-item label="购买手续费" prop="buyfee">
              <el-input v-model="buyfee" clearable />
            </el-form-item>
            <el-form-item label="出售手续费" prop="sellfee">
              <el-input v-model="sellfee" clearable />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="feeSetDialog = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditFeeTure()">保存修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCtcOtcPrice,
  addCtcOtcPrice,
  updateCtcOtcPrice,
  delCtcOtcPrice
} from '@/api/otc'
import { listFee, updateFee } from '@/api/otcfee'

export default {
  data() {
    return {
      loading: true,
      pageShow: true,
      dialogFormVisible: false,
      rebateType: '',
      form: {
        currency: '',
        platform: '',
        minprice: '',
        maxprice: '',
        id: ''
      },
      // 表单校验
      rules: {
        currency: [
          { required: true, message: this.$t('financemanager.currencyCannotBeEmpty'), trigger: 'blur' }
        ],
        platform: [
          { required: true, message: '平台不能为空', trigger: 'blur' }
        ],
        minprice: [
          { required: true, message: '挂单最小金额不能为空', trigger: 'blur' }
        ],
        maxprice: [
          { required: true, message: '挂单最大金额不能为空', trigger: 'blur' }
        ]
      },
      feeRules: {
        buyfee: [{ required: true, message: '购买手续费不能为空', trigger: 'blur' }],
        sellfee: [{ required: true, message: '出售手续费不能为空', trigger: 'blur' }]
      },
      change: {},
      title: '',
      tableData: [],
      status: '',
      formLabelWidth: '140px',
      feeSetDialog: false,
      activeName: 'USDT',
      feeloading: true,
      otcFeeList: [],
      sellfee: '',
      buyfee: '',
      currency: '',
      feeform: {},
      map: []
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
      const data = {}
      listCtcOtcPrice(data)
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
    addHandle() {
      (this.form = {
        currency: '',
        platform: '',
        minprice: '',
        maxprice: ''
      }),
      (this.status = true)
      this.dialogFormVisible = true
    },
    handleClick(tab, event) {
      this.feeSetDialog = true
      this.currency = this.activeName
      if (this.map[this.currency]) {
        this.buyfee = this.map[this.currency][0].rate
        this.sellfee = this.map[this.currency][1].rate
      } else {
        this.buyfee = '0'
        this.sellfee = '0'
      }
    },
    setOtcfee() {
      this.feeSetDialog = true
      this.getotcfee()
      this.feeload()
    },
    feeload() {
      this.feeloading = true
      // 去空值
      const data = {}
      listCtcOtcPrice(data)
        .then(response => {
          if (response.code == 200) {
            this.otcFeeList = response.rows
            this.activeName = this.otcFeeList[0].currency
          } else {
            this.otcFeeList = []
            this.msgError(response.msg)
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    getotcfee() {
      this.feeloading = true
      // 去空值
      const data = {}
      listFee(data)
        .then(response => {
          if (response.code == 200) {
            this.map = response.data
            this.feeloading = false
          } else {
            this.msgError(response.msg)
          }
          this.handleClick()
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 修改
    handleEdit(row, index) {
      this.status = false
      for (const list in index) {
        this.form[list] = index[list]
      }
      this.dialogFormVisible = true
    },
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
      if (this.status) {
        addCtcOtcPrice(this.form)
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
      } else {
        updateCtcOtcPrice(this.form)
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
    },
    handleEditFeeTure() {
      if (this.buyfee == undefined || this.buyfee == null || this.buyfee == '' ||
      this.sellfee == undefined || this.sellfee == null || this.sellfee == '') {
        this.$message({
          showClose: true,
          message: '请填写全部信息',
          type: 'error'
        })
        return
      }
      this.feeloading = true
      this.updateFee()
    },
    updateFee(symbol, buyfee, sellfee) {
      const data = {
        symbol: this.currency,
        buyFee: this.buyfee,
        sellFee: this.sellfee
      }
      updateFee(data)
        .then(response => {
          if (response.code == 200) {
            this.$message({
              showClose: true,
              message: '修改成功',
              type: 'success'
            })
          } else {
            this.$message({
              showClose: true,
              message: '删除失败',
              type: 'error'
            })
          }
          this.feeload()
          this.setOtcfee()
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
          delCtcOtcPrice({ id: index.id })
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
