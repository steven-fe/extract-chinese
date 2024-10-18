<template>
  <div class="systemAccountMange">
    <div class="search">
      <span class="label">{{ $t('financemanager.specialAccountName') }}</span>
      <el-input
        v-model="accountName"
        style="width:200px"
        :placeholder="$t('financemanager.pleaseEnterYourAccountName')"
        clearable
      />
      <div class="btnBox">
        <el-button type="primary" @click="searchAccountName">{{ $t('common.search') }}</el-button>
        <el-button type="primary" @click="addAccount">{{ $t('common.newAdd') }}</el-button>
      </div>
    </div>
    <div class="mange-table">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="accountName" :label="$t('financemanager.accountTitle')" />
        <el-table-column prop="userId" :label="$t('contractmanager.accountID')" />
        <el-table-column prop="address" :label="$t('common.accountType')">
          <template slot-scope="scope">
            {{ scope.row.sysAccountType === 1 ? $t('financemanager.financialAccount') : $t('financemanager.businessAccount') }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('common.operation')" width="350px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleClick(scope.row)"
            >{{ $t('financemanager.balanceInquiry') }}</el-button>
            <el-button
              type="warning"
              size="small"
              @click="fixAccount(scope.row)"
            >{{ $t('common.modify') }}</el-button>

            <el-button
              type="danger"
              size="small"
              @click="delate(scope.row.id)"
            >{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="sort-pageNation"
      :current-page="pageNum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog :title="currentTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-form-item :label="$t('financemanager.accountTitle')" prop="accountName">
          <el-input v-model="form.accountName" />
        </el-form-item>
        <el-form-item :label="$t('common.accountType')">
          <el-radio-group v-model="form.sysAccountType">
            <el-radio
              :label="1"
              :disabled="dialogType !== 'add'"
            >{{ $t('financemanager.financialAccount') }}</el-radio>
            <el-radio
              :label="2"
              :disabled="dialogType !== 'add'"
            >{{ $t('financemanager.businessAccount') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureAdd">{{
          dialogType === 'add' ? $t('financemanager.confirmAdd') : $t('financemanager.confirmEdit')
        }}</el-button>
      </span>
    </el-dialog>

    <!-- 查询余额dialog -->
    <el-dialog :visible.sync="dialogVisibleSearch" width="80%">
      <DialogContent :user-id="userId" />
      <!-- <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureAdd">确认</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import DialogContent from './dialogContent.vue'
import {
  getAccountList,
  addNewAccount,
  fixAccount,
  deleteAccount
} from '@/api/systemAccountMange/index.js'
export default {
  name: 'SystemAccountMange',
  components: { DialogContent },
  data() {
    const checkName = (rule, value, callback) => {
      if (value.length > 20) {
        return callback(new Error(this.$t('financemanager.valueIsAMaximumOf20Bytes')))
      } else if (!value) {
        return callback(new Error(this.$t('financemanager.accountNameCannotBeEmpty')))
      } else {
        callback()
      }
    }
    return {
      options: [],
      accountName: '',
      dialogVisible: false,
      dialogVisibleSearch: false,
      dialogType: 'add',
      loading: true,
      tableData: [],
      userId: '',
      fixInfo: {
        id: ''
      },
      form: {
        accountName: '',
        sysAccountType: 2
      },
      rules: {
        accountName: [
          { required: true, message: this.$t('financemanager.pleaseEnterYourAccountName'), trigger: 'blur' },
          {
            validator: checkName,
            trigger: 'blur'
          }
        ]
      },
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  },
  computed: {
    currentTitle() {
      return this.dialogType === 'add' ? this.$t('financemanager.newSpecialAccount') : this.$t('financemanager.modificationOfSpecialAccount')
    }
  },

  created() {
    this.getAccountListInfo()
  },

  methods: {
    handleClick(row) {
      this.dialogVisibleSearch = true
      this.userId = row.userId
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getAccountListInfo()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getAccountListInfo()
    },
    // 获取查询列表
    getAccountListInfo() {
      const data = {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        accountName: this.accountName
      }
      getAccountList(data)
        .then((res) => {
          this.loading = false
          if (res.code === 200) {
            this.tableData = res.rows
            this.total = res.total
          } else {
            this.tableData = []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetFormInfo() {
      this.form = {
        accountName: '',
        sysAccountType: 2
      }
    },
    // 新增特殊账户
    addNewAccountInfo() {
      const data = {
        ...this.form
      }
      addNewAccount(data).then((res) => {
        if (res.code === 200) {
          this.$message({
            message: this.$t('common.addSuccess'),
            type: 'success'
          })
          this.dialogVisible = false
          this.getAccountListInfo()
        } else {
          this.$message.error(this.$t('financemanager.addError'))
        }
      })
    },
    // 修改
    fixAccount(row) {
      this.dialogType = 'fix'
      const { accountName, sysAccountType } = row
      this.form = {
        accountName,
        sysAccountType
      }
      this.dialogVisible = true
      this.fixInfo.id = row.id
    },
    // 删除
    delate(id) {
      this.$alert(this.$t('financemanager.confirmToDelete'), '', {
        confirmButtonText: this.$t('common.sure'),
        callback: (action) => {
          if (action === 'cancel') return
          deleteAccount(id).then((res) => {
            if (res.code === 200) {
              this.$message({
                message: this.$t('common.deleteSuccess'),
                type: 'success'
              })
              this.getAccountListInfo()
            } else {
              this.$message.error(this.$t('common.deleteError'))
            }
          })
        }
      })
    },
    searchAccountName() {
      this.pageNum = 1
      this.getAccountListInfo()
    },
    sureAdd() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'add') {
            this.addNewAccountInfo()
          } else {
            fixAccount({
              id: this.fixInfo.id,
              accountName: this.form.accountName
            }).then((res) => {
              if (res.code === 200) {
                this.$message({
                  message: this.$t('common.modifySuccess'),
                  type: 'success'
                })
                this.dialogVisible = false
                this.getAccountListInfo()
              } else {
                this.$message.error(this.$t('financemanager.failToModify'))
              }
            })
          }
        }
      })
    },
    addAccount() {
      this.dialogType = 'add'
      this.resetFormInfo()
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.systemAccountMange {
  padding: 20px;

  .search {
    display: flex;
    align-items: center;

    ::v-deep .el-input {
      margin-left: 20px;
    }

    .btnBox {
      margin-left: 20px;
    }
  }
  .mange-table {
    margin-top: 20px;
    padding-bottom: 20px;
  }
}
</style>
