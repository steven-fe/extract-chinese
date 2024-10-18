<template>
  <div class="app-container">
    <div>
      <h3>钱包账户</h3>
      <el-table
        v-loading="loading"
        border
        :data="tableWalletData"
        style="width: 100%"
      >
        <el-table-column
          prop="currency"
          align="center"
          :label="$t('common.coin')"
        />
        <el-table-column
          prop="balance"
          align="center"
          label="总资产"
        />
        <el-table-column
          prop="usableAmount"
          align="center"
          label="可用"
        />
        <el-table-column
          prop="frostAmount"
          align="center"
          label="冻结"
        />
        <el-table-column label="锁仓" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.lockAmount">{{ scope.row.lockAmount }}</span>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operation')" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row, 1)"
            >锁仓
            </el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row, 2)"
            >
              解锁
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div style="margin-top: 50px">
      <h3>合约账户</h3>
      <el-table
        v-loading="loadingCfd"
        border
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          prop="currency"
          align="center"
          :label="$t('common.coin')"
        />
        <el-table-column
          prop="balance"
          align="center"
          label="总资产"
        />
        <el-table-column
          prop="usableAmount"
          align="center"
          label="可用"
        />
        <el-table-column
          prop="frostAmount"
          align="center"
          label="冻结"
        />
      </el-table>
    </div>
    <div style="margin-top: 50px">
      <h3>期权账户</h3>
      <el-table
        v-loading="loadingOption"
        border
        :data="tableOptionData"
        style="width: 100%"
      >
        <el-table-column
          prop="currency"
          align="center"
          :label="$t('common.coin')"
        />
        <el-table-column
          prop="balance"
          align="center"
          label="总资产"
        />
        <el-table-column
          prop="usableAmount"
          align="center"
          label="可用"
        />
        <el-table-column
          prop="frostAmount"
          align="center"
          label="冻结"
        />
      </el-table>
    </div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="500px"
    >
      <el-form ref="subForm" :model="subForm" :rules="rules" label-width="95px">
        <el-form-item :label="$t('common.coin')" prop="symbol">
          <el-select v-model="subForm.symbol" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="typetitle" prop="oldamount">
          <el-input v-model="subForm.oldamount" disabled />
        </el-form-item>
        <el-form-item :label="typetitle2" prop="newamount">
          <el-input v-model="subForm.newamount" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="操作备注：" prop="memo">
          <el-input
            v-model="subForm.memo"
            type="textarea"
            :rows="5"
            placeholder="请输入操作备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          :disabled="disabledSubmitForm"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  walletList,
  optionList,
  cfdAccountList,
  walletLock,
  walletUnlock
} from '@/api/userinfo/userInfo'
export default {
  props: ['msg'],
  data() {
    return {
      title: undefined,
      handleType: undefined,
      typetitle: undefined,
      typetitle2: undefined,
      loading: true,
      loadingOption: true,
      loadingCfd: true,
      tableData: [],
      tableWalletData: [],
      tableOptionData: [],
      disabledSubmitForm: false,
      dialogVisible: false,
      subForm: {},
      rules: {
        newamount: [
          { required: true, message: this.$t('contractmanager.amountCannotBeEmpty'), trigger: 'blur' }
        ]
      },
      form: {
        userId: this.msg
      }
    }
  },
  created() {
    this.load()
    this.loadOption()
    this.loadCfd()
  },
  methods: {
    load() {
      this.loading = true
      walletList(this.form)
        .then((response) => {
          if (response.code == 200) {
            this.tableWalletData = response.rows
          } else {
            this.tableWalletData = []
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    loadOption() {
      this.loadingOption = true
      optionList(this.form)
        .then((response) => {
          if (response.code == 200) {
            this.tableOptionData = response.rows
          } else {
            this.tableOptionData = []
            this.msgError(response.msg)
          }
          this.loadingOption = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    loadCfd() {
      this.loadingCfd = true
      cfdAccountList(this.form)
        .then((response) => {
          if (response.code == 200) {
            this.tableData = response.rows
          } else {
            this.tableData = []
            this.msgError(response.msg)
          }
          this.loadingCfd = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    cancel() {
      this.dialogVisible = false
      this.title = undefined
      this.typetitle = undefined
      this.typetitle2 = undefined
      this.subForm = {}
      this.disabledSubmitForm = false
      this.load()
    },
    handleUpdate(row, type) {
      this.subForm.symbol = row.currency
      this.handleType = type
      if (type == 1) {
        this.title = '锁仓资产'
        this.typetitle = '可用余额'
        this.typetitle2 = '锁仓金额'
        this.subForm.oldamount = row.usableAmount ? row.usableAmount : 0
      } else {
        this.title = '解锁资产'
        this.typetitle = '当前锁仓'
        this.typetitle2 = '解锁金额'
        this.subForm.oldamount = row.lockAmount ? row.lockAmount : 0
      }
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs['subForm'].validate((valid) => {
        if (valid) {
          this.disabledSubmitForm = true
          const date = {
            uid: this.form.userId,
            symbol: this.subForm.symbol,
            amount: this.subForm.newamount,
            memo: this.subForm.memo
          }
          if (this.handleType == 1) {
            walletLock(date)
              .then((res) => {
                if (res.code == 200) {
                  this.msgSuccess('锁仓成功！')
                } else {
                  this.msgError(res.msg)
                }
                this.cancel()
              })
              .catch((error) => {
                this.disabledSubmitForm = false
                console.log(error)
              })
          } else if (this.handleType == 2) {
            walletUnlock(date)
              .then((res) => {
                if (res.code == 200) {
                  this.msgSuccess('解锁成功！')
                } else {
                  this.msgError(res.msg)
                }
                this.cancel()
              })
              .catch((error) => {
                this.disabledSubmitForm = false
                console.log(error)
              })
          }
        }
      })
    }
  }
}
</script>

