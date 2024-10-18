<!--冻结资产-->
<template>
  <div class="app-container">
    <el-form
      ref="digform"
      :model="queryParams"
      :inline="true"
      :rules="rules"
      label-width="130px"
    >
      <div>
        <h3>{{ $t('financemanager.assetInquiry') }}</h3>
        <el-form-item class="grid-item" label="UID:" prop="userId">
          <el-input v-model.trim="queryParams.userId" :placeholder="$t('frozen.pleaseEnterUID')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('common.accountType')" prop="bizType">
          <div style="padding-left: 10px;width: 100%;float: left">{{ $t('usermanage.text61') }}</div>
        </el-form-item>
        <el-form-item :label="$t('common.coin')" prop="currencyId">
          <el-select v-model="queryParams.currencyId" style="width: 100%" :placeholder="$t('financemanager.currencyCode1')" filterable>
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
            @click="getUserBalance"
          >{{ $t('common.query') }}</el-button>
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('usermanage.text61')" prop="spotAvailableBalance" label-width="260px">
          <el-input v-model.trim="this.data.spotAvailableBalance" disabled="disabled" clearable />
        </el-form-item>
      </div>

      <div>
        <h3>{{ $t('financemanager.freeze') }}</h3>
        <el-form-item class="grid-item" :label="$t('common.remarks')" prop="remarks">
          <el-input v-model.trim="queryParams.remarks" :placeholder="$t('common.remarks')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('financemanager.accountType')" prop="bizType" label-width="150px">
          <div class="explain">{{ $t('frozen.manualFreezing') }}</div>
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('common.amount')" prop="amount">
          <el-input v-model.trim="queryParams.amount" :placeholder="$t('financemanager.pleaseEnterTheAmount')" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">{{ $t('financemanager.freeze') }}</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div>
      <h3>{{$t('frozen.batchFreezing')}}{{ recordData && recordData.status === 0 ? $t('dwmanager.beingProcessed') : '' }}</h3>
      <div class="batch-freeze">
        <el-upload
            ref="upload"
            action="#"
            :on-change="handleChange"
            :show-file-list="false"
            accept=".xls,.xlsx"
            :auto-upload="false"
            class="upload-demo"
        >
          <el-button type="primary">{{$t('frozen.uploadExcel')}}Excel</el-button>
          <span style="font-size: 14px; color: #999; margin: 0 30px 0 10px;">{{ batchParams.fileName }}</span>
        </el-upload>
        <div>
          <el-button type="primary" @click="down">{{$t('frozen.downloadTemplate')}}</el-button>
          <el-button type="primary" @click="batchAdd">{{$t('financemanager.confirmImport')}}</el-button>
        </div>
        <div class="explain">
          <div>{{$t('frozen.freezingFunctionDescription')}}</div>
          <div>{{$t('frozen.onlyFrozenSpotIsSupported')}}</div>
          <br>
          <div>{{$t('frozen.batchFreezingMethodOfUse')}}</div>
          <div>1、{{$t('frozen.uploadAnExcelFileThatIncludes')}}</div>
          <div> （1）{{$t('dwmanager.userUID')}}；</div>
          <div> （2）{{$t('frozen.freezeCurrencyNames')}}；</div>
          <div> （3）{{$t('frozen.freezingNumber')}}；</div>
          <div> （4）{{$t('frozen.returnToTheResult')}}</div>
        </div>
      </div>
    </div>
    <el-dialog :title="$t('frozen.freezeExecutionResults')" :visible.sync="visible" width="1000px" top="5vh">
      <el-table border class="top" :data="tableData" style="width: 100%">
        <el-table-column prop="totalNum" :label="$t('frozen.totalFrozenExecution')" align="center"/>
        <el-table-column prop="successNum" :label="$t('frozen.freezeExecutionResults')" align="center">
          <template slot-scope="scope">
            {{$t('frozen.result', {successNum: scope.row.successNum, failNum: scope.row.failNum})}}
          </template>
        </el-table-column>
        <el-table-column prop="failNum" :label="$t('frozen.downloadFreezeExecutionFailureRecords')" align="center" width="350px">
          <template slot-scope="scope">
            <el-button v-show="+scope.row.failNum > 0" type="primary" @click="downexcel(scope.row.failExcel)">{{$t('frozen.downloadFailureRecord')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="visible = false">{{$t('common.sure')}}</el-button>
        <el-button @click="visible = false">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { frozen, getUserBalance } from '@/api/finance/transfer'
import { getUserByUid } from '@/api/user'
import {mapActions, mapState} from 'vuex'
import {getNowFormatDate, param} from "@/utils";
import { uploadFrozenExcel, recoveryBatch, getBatchFrozenRecord, getBatchFrozenExcel } from "@/api/finance/freecurrency";
import {exportRecord} from "@/api/contract/accountConfirm";
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
      tableData: [],
      visible: false,
      open: false,
      recordData: '',
      batchParams: { fileName: this.$t('financemanager.unselectedFile') },
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
        userId: '',
        remarks: '',
        currencyId: '',
        amount: ''
      },
      coinList: [],
      rules: {
        currencyId: [
          { required: true, message: this.$t('financemanager.currencyCannotBeEmpty'), trigger: 'blur' }
        ],
        remarks: [
          { required: true, message: this.$t('dwmanager.remarkCannotBeEmpty'), trigger: 'blur' }
        ],
        userId: [
          { required: true, message: this.$t('financemanager.uidCannotBeEmpty'), trigger: 'blur' }
        ],
        amount: [
          { required: true, message: this.$t('contractmanager.amountCannotBeEmpty'), trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ]
      },
      timer: null
    }
  },
  created() {
    // this.getList()
    this.getCurrency()
    this.getBatchFrozenRecord()
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    }
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    downexcel (url) {
      this.download(url)
    },
    // 获取冻结进度
    async getBatchFrozenRecord () {
      const { data } = await getBatchFrozenRecord()
      // 0:进行中 1:处理完成， 当状态值为1 时 ，调用获取失败excel 接口
      this.recordData = data
      if (data && data.status === 1) {
        getBatchFrozenExcel({ batchNo: data.batchNo }).then(res => {
          this.visible = true
          this.tableData = [res.data]
        })
      }
      if (data && data.status === 0 && !this.timer) {
        this.timer = setInterval(() => {
          if (!this.recordData || this.recordData.status !== 0) {
            clearInterval(this.timer)
            this.timer = null
          } else {
            this.getBatchFrozenRecord()
          }
        }, 5000)
      }
    },
    // 文件选择
    handleChange(file) {
      this.batchParams.file = file.raw
      this.batchParams.fileName = `${file.name}`
    },
    // 批量上传
    batchAdd() {
      if (!this.batchParams.file) {
        this.$message({
          type: 'error',
          message: this.$t('financemanager.unselectedFile')
        })
        return
      }
      this.$confirm(this.$t('frozen.batchFreezingOperationsArePerformed'), this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        uploadFrozenExcel(this.batchParams).then(res =>　{
          this.batchParams.file = ''
          this.batchParams.fileName = this.$t('financemanager.unselectedFile')
          this.$message({
            type: 'success',
            message: this.$t('common.uploadSucceeded')
          })
          setTimeout(() => {
            this.getBatchFrozenRecord()
          }, 1000)
        })
      }).catch(error => {
        this.$message({
          type: 'info',
          message: this.$t('financemanager.unfreeze')
        })
      })
    },
    submit() {
      this.$refs.digform.validate((valid) => {
        if (valid) {
          this.$confirm(this.$t('financemanager.whetherToFreezeTheFundsInTheAccount'), this.$t('common.prompt'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            const params = {
              userUid: this.queryParams.userId,
              amount: this.queryParams.amount,
              remark: this.queryParams.remarks
            }
            params.currencyCode = this.codeOptions.find(item => item.id === this.queryParams.currencyId).name
            frozen(params).then(res => {
              this.$message({
                type: 'success',
                message: this.$t('financemanager.freezingSuccess')
              })
              this.$refs.digform.resetFields()
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('financemanager.unfreeze')
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
      this.title = this.$t('financemanager.frozenAssets')
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
    down () {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/batchFrozenTemplate.xlsx')
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.form.meta = 'present'
          frozen(this.form)
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

<style scoped lang="scss">
.explain {
  span {
    color: red;
  }
}
.batch-freeze {
  display: flex;
  margin-left: 80px;
  .text {
    margin-left: 10px;
    margin-right: 30px;
  }
  .explain {
    margin-left: 30px;
    width: 520px;
    align-self: flex-start;
    border: 1px solid #e4e1e1;
    color: #858181;
    padding: 10px;
  }
}
</style>
