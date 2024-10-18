<template>
  <div class="businessTypes">
    <div class="search">
      <span class="label">{{ $t('financemanager.businessType') }}</span>
      <el-input
        v-model="name"
        style="width:200px"
        :placeholder="$t('financemanager.pleaseEnterTheBusinessType')"
        clearable
      />
      <div class="btnBox">
        <el-button type="primary" @click="saerch">{{ $t('common.query') }}</el-button>
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
        <el-table-column prop="name" :label="$t('financemanager.subbusinessType')" />
        <el-table-column prop="parentName" :label="$t('financemanager.businessType')">
          <template slot-scope="scope">{{
            findParentName(scope.row.pid)
          }}</template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('common.operation')">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="fixInfo(scope.row)"
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
    <el-dialog
      :title="dialogType === 'add' ? $t('financemanager.theSubServiceTypeIsAdded') : $t('financemanager.changeTheSubserviceType')"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        :label-position="labelPosition"
        :rules="rules"
      >
        <el-form-item :label="$t('financemanager.accountTitle')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="$t('financemanager.businessType')" prop="pid">
          <el-select
            v-model="form.pid"
            :placeholder="$t('common.pleaseChoose')"
            :disabled="dialogType !== 'add'"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="dialogVisible = false"
        >{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="sureAdd">{{ $t('common.Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getList,
  getParentList,
  addList,
  fixInfo,
  delateInfo
} from '@/api/bussinessType/index.js'
export default {
  name: 'BusinessTypes',
  data() {
    const checkName = (rule, value, callback) => {
      if (value.length > 20) {
        return callback(new Error(this.$t('financemanager.valueIsAMaximumOf20Bytes')))
      } else if (!value) {
        return callback(new Error(this.$t('financemanager.enterTheSubbusinessType')))
      } else {
        callback()
      }
    }
    return {
      labelPosition: 'left',
      name: '',
      tableData: [],
      options: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogType: 'add',
      loading: false,
      form: {
        name: '',
        pid: ''
      },
      rules: {
        name: [
          {
            validator: checkName,
            trigger: 'blur'
          },
          {
            required: true,
            message: this.$t('financemanager.enterTheSubbusinessType'),
            trigger: 'blur'
          }
        ],
        pid: [
          {
            required: true,
            message: this.$t('financemanager.selectTheServiceType'),
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.getListInfo()
    this.getParentListInfo()
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
      this.getListInfo()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getListInfo()
    },
    getParentListInfo() {
      getParentList().then((res) => {
        if (res.code === 200) {
          this.options = res.data
        }
      })
    },
    getListInfo() {
      const data = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        name: this.name
      }
      this.loading = true
      getList(data)
        .then((res) => {
          if (res.code === 200) {
            this.tableData = res.rows
            this.total = res.total
          } else {
            this.tableData = []
            this.total = 0
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    findParentName(pid) {
      const parentName = this.options.find((item) => item.id === pid).name
      return parentName
    },
    resetInfo() {
      this.form = {
        name: '',
        pid: ''
      }
    },
    addInfo() {
      const data = {
        ...this.form
      }
      addList(data).then((res) => {
        if (res.code === 200) {
          this.$message({
            message: this.$t('financemanager.increaseSuccess'),
            type: 'success'
          })
          this.dialogVisible = false
          this.getListInfo()
        } else {
          this.$message.error(this.$t('financemanager.addFailure'))
        }
      })
    },
    fixInfo(row) {
      this.dialogType = 'fix'
      this.dialogVisible = true
      this.form = {
        name: row.name,
        pid: row.pid,
        id: row.id
      }
    },
    sureAdd() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'add') {
            this.addInfo()
          } else {
            this.dialogVisible = true
            fixInfo({
              ...this.form
            }).then((res) => {
              if (res.code === 200) {
                this.$message({
                  message: this.$t('common.modifySuccess'),
                  type: 'success'
                })
                this.dialogVisible = false
                this.getListInfo()
              } else {
                this.$message.error(this.$t('financemanager.failToModify'))
              }
            })
          }
        }
      })
    },
    saerch() {
      this.pageNum = 1
      this.getListInfo()
    },
    delate(id) {
      this.$alert(this.$t('financemanager.confirmToDelete'), '', {
        confirmButtonText: this.$t('common.sure'),
        callback: (action) => {
          if (action === 'cancel') return
          delateInfo(id).then((res) => {
            if (res.code === 200) {
              this.$message({
                message: this.$t('common.deleteSuccess'),
                type: 'success'
              })
              this.getListInfo()
            } else {
              this.$message.error(this.$t('common.deleteError'))
            }
          })
        }
      })
    },
    addAccount() {
      this.dialogType = 'add'
      this.resetInfo()
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.businessTypes {
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
    margin: 20px 0;
  }
}
</style>
