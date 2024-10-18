<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="转出账户" prop="fromUid">
        <el-input
          v-model="queryParams.fromUid"
          placeholder="请输入转出账户"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="转入账户" prop="toUid">
        <el-input
          v-model="queryParams.toUid"
          placeholder="请输入转入账户"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('financemanager.operator')" prop="opUid">
        <el-input
          v-model="queryParams.opUid"
          placeholder="请输入操作人"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="success" icon="el-icon-edit" size="mini" @click="handleTool">空投工具</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" border :data="tableList">
      <el-table-column label="时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="转出账户" align="center" prop="fromUid" />
      <el-table-column label="转入账户" align="center" prop="toUid" />
      <el-table-column label="转账金额" align="center" prop="amount">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}{{ scope.row.currency }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('common.remarks')" align="center" prop="meta" width="180" /> -->
      <el-table-column
        :label="$t('financemanager.operator')"
        align="center"
        class-name="small-padding fixed-width"
        prop="opUid"
      />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 划转工具 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="$t('common.coin')" prop="currency">
          <el-select v-model="form.currency" filterable placeholder="请选择币种">
            <el-option v-for="(item,index) in coinList" :key="index" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="转至" prop="to">
          <el-input v-model="form.to" :placeholder="$t('frozen.pleaseEnterUID')" @change="getToAccount" />
        </el-form-item>
        <el-form-item label="登录账号(转入)" prop="toAccount">
          <el-input v-model="toAccount" disabled />
        </el-form-item>
        <el-form-item label="数量" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item v-show="false" :label="$t('common.remarks')" prop="meta">
          <el-input v-model="form.meta" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="submitForm">立即划转</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { cfdTransfer, listCfdTransfer } from '@/api/finance/cfdtransfer'
import { listSupportTokenByType } from '@/api/coin'
import { getUserByUid } from '@/api/user'
export default {
  data() {
    var checkQuota = (rule, value, callback) => {
      const reg = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g
      if (value === '') {
        callback(new Error(this.$t('frozen.pleaseEnterContent')))
      } else if (!reg.test(value)) {
        callback(new Error(this.$t('frozen.pleaseEnterTheNumber')))
      }
      if (String(value).includes(' ')) {
        callback(new Error(this.$t('frozen.cannotContainSpaces')))
      }
      if (value <= 0) {
        callback(new Error(this.$t('frozen.theAmountMustBeGreaterThan0')))
      } else {
        callback()
      }
    }
    return {
      open: false,
      form: {},
      // 弹出层标题
      title: '',
      loading: true,
      tableList: [],
      fromAccount: undefined,
      toAccount: undefined,
      total: 0,
      queryParams: {
        fromUid: undefined,
        toUid: undefined,
        opUid: undefined,
        pageNum: undefined,
        pageSize: undefined
      },
      coinList: [],
      rules: {
        currency: [
          { required: true, message: this.$t('financemanager.currencyCannotBeEmpty'), trigger: 'blur' }
        ],
        from: [
          { required: true, message: '转出UID不能为空', trigger: 'blur' },
          { pattern: /^[1-9]\d*$/, message: '参数错误', trigger: 'blur' }
        ],
        to: [
          { required: true, message: '转入UID不能为空', trigger: 'blur' },
          { pattern: /^[1-9]\d*$/, message: '参数错误', trigger: 'blur' }
        ],
        amount: [{ validator: checkQuota, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getCoinList()
  },
  methods: {
    getList() {
      this.loading = true
      listCfdTransfer(this.queryParams)
        .then((response) => {
          if (response.code == 200) {
            this.tableList = response.rows
            this.total = response.total
            this.loading = false
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    getCoinList() {
      const form = {
        is_support_cfd: 1
      }
      listSupportTokenByType(form)
        .then((response) => {
          if (response.code == 200) {
            response.rows.forEach((element) => {
              this.coinList.push(element.currency)
            })
          } else {
            this.coinList = []
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    handleTool() {
      this.open = true
      this.title = '空投工具'
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        currency: undefined,
        from: undefined,
        to: undefined,
        amount: undefined,
        meta: 'airdrop'
      }
      this.fromAccount = undefined
      this.toAccount = undefined
      this.resetForm('form')
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.form.meta = 'present'
          cfdTransfer(this.form)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess('空投成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
              this.open = false
              this.getList()
            })
            .catch((error) => {
              console.log(error)
            })
        }
      })
    },
    getFromAccount(value) {
      setTimeout(() => {
        const formData = {
          uid: this.form.from
        }
        getUserByUid(formData)
          .then((response) => {
            if (response.code == 200) {
              if (response.data) {
                if (response.data.phone != null && response.data.phone != '') {
                  this.fromAccount = response.data.phone
                } else {
                  this.fromAccount = response.data.email
                }
              } else {
                this.fromAccount = undefined
              }
            } else {
              this.fromAccount = undefined
              this.msgError(response.msg)
            }
          })
          .catch((error) => {
            console.log(error)
          })
      }, 500)
    },
    getToAccount(value) {
      setTimeout(() => {
        const formData = {
          uid: this.form.to
        }
        getUserByUid(formData)
          .then((response) => {
            if (response.code == 200) {
              if (response.data) {
                if (response.data.phone != null && response.data.phone != '') {
                  this.toAccount = response.data.phone
                } else {
                  this.toAccount = response.data.email
                }
              } else {
                this.toAccount = undefined
              }
            } else {
              this.toAccount = undefined
              this.msgError(response.msg)
            }
          })
          .catch((error) => {
            console.log(error)
          })
      }, 500)
    }
  }
}
</script>

<style scoped>
</style>
