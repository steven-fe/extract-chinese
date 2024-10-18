<template>
  <div class="app-container">
    <el-form
      ref="digform"
      :model="queryParams"
      :inline="true"
      :rules="rules"
      label-width="80px"
    >
      <div>
        <h3>转出</h3>
        <el-form-item class="grid-item" label="UID:" prop="fromUserId">
          <el-input v-model.trim="queryParams.fromUserId" :placeholder="$t('frozen.pleaseEnterUID')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('common.accountType')" prop="bizType">
          <div style="padding-left: 10px;width: 100%;float: left">用户:余额</div>
        </el-form-item>
        <el-form-item label="币种代码:" prop="currencyId">
          <el-select v-model="queryParams.currencyId" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')">
            <el-option
              v-for="(item) in codeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
          >查询</el-button>
        </el-form-item>
        <el-form-item class="grid-item" label="账户余额:" prop="spotAvailableBalance">
          <el-input v-model.trim="this.data.spotAvailableBalance" disabled="disabled" clearable />
        </el-form-item>
      </div>
      <div>
        <h3>转入</h3>
        <el-form-item class="grid-item" label="UID:" prop="toUserId">
          <el-input v-model.trim="queryParams.toUserId" :placeholder="$t('frozen.pleaseEnterUID')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('common.accountType')" prop="bizType">
          <div style="padding-left: 10px;width: 100%;float: left">用户:余额</div>
        </el-form-item>
        <el-form-item class="grid-item" label="金额:" prop="volume">
          <el-input v-model.trim="queryParams.volume" placeholder="请输入金额" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </div>

    </el-form>
  </div>
</template>

<script>
import { transfer, getUserBalance } from '@/api/finance/transfer'
import { getUserByUid } from '@/api/user'
import { mapState } from 'vuex'
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
      data: '',
      fromAccount: undefined,
      toAccount: undefined,
      total: 0,
      queryParams: {
        fromUserId: '',
        toUserId: '',
        currencyId: '',
        volume: '',
        userId: ''
      },
      coinList: [],
      rules: {
        currencyId: [
          { required: true, message: this.$t('financemanager.currencyCannotBeEmpty'), trigger: 'blur' }
        ],
        fromUserId: [
          { required: true, message: '转出UID不能为空', trigger: 'blur' },
          { pattern: /^[1-9]\d*$/, message: '参数错误', trigger: 'blur' }
        ],
        toUserId: [
          { required: true, message: '转入UID不能为空', trigger: 'blur' },
          { pattern: /^[1-9]\d*$/, message: '参数错误', trigger: 'blur' }
        ],
        volume: [
          { required: true, message: this.$t('contractmanager.amountCannotBeEmpty'), trigger: 'blur' }
        ],
        amount: [{ validator: checkQuota, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getCoinList()
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    }
  },
  methods: {
    ...mapState('systemsetting', ['currencyList']),
    submit() {
      this.$refs.digform.validate((valid) => {
        if (valid) {
          this.$confirm('<div>转出UID:' + this.queryParams.fromUserId + '余额账户</div>' +
              '<div>转入UID:' + this.queryParams.toUserId + '余额账户</div>' +
              '金额:' + this.queryParams.volume + this.currencyList.find(el => el.id === this.queryParams.currencyId).name, this.$t('common.prompt'), {
            dangerouslyUseHTMLString: true,
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            transfer(this.queryParams).then(res => {
              this.$message({
                type: 'success',
                message: '划转成功'
              })
              this.$refs.digform.resetFields()
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('financemanager.transferHasBeenCancelled')
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getUserBalance() {
      this.loading = true
      this.queryParams.userId = this.queryParams.fromUserId
      getUserBalance(this.queryParams)
        .then((response) => {
          if (response.code == 200) {
            this.data = response.data
            this.loading = false
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    handleTool() {
      this.open = true
      this.title = '转账工具'
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        currency: undefined,
        from: undefined,
        to: undefined,
        amount: undefined,
        meta: 'present'
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
      this.getUserBalance()
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
          transfer(this.form)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess(this.$t('financemanager.transferSuccessful'))
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
