<template>
  <div class="app-container">
    <h3>{{$t('frozen.spotOrderWithdrawal')}}{{ recordData && recordData.status === 0 ? $t('dwmanager.beingProcessed') : '' }}</h3>
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
        <div>{{$t('frozen.instructionsForUse')}}</div>
        <div>{{$t('frozen.selectTheWithdrawalService')}}</div>
        <div>{{$t('frozen.documentsToInclude')}}</div>
        <div>{{$t('frozen.userUID')}}</div>
        <div>{{$t('frozen.transactionPair')}}</div>
        <div>{{$t('frozen.withdrawalType')}}</div>
        <div>{{$t('frozen.withdrawalInstruction')}}</div>
        <div>{{$t('frozen.rmark')}}</div>
        <div>{{$t('frozen.theResultIsReturnedBasedOnTheExecutionStatus')}}</div>
      </div>
    </div>
    <!--    撤单说明模板-->
    <div>
      <h3>{{$t('frozen.withdrawalDescriptionTemplate')}}</h3>
      <el-button type="primary" @click="show = true">{{$t('frozen.newTemplate')}}</el-button>
      <el-table border class="top" :data="tableData" style="width: 100%;margin-top: 20px">
        <el-table-column prop="successNum" align="center" min-width="200px">
          <template slot-scope="scope">
            <el-button type="primary" @click="changeTemplateStatus(scope.row)">{{ scope.row.status === 0 ? $t('red.cancelDefault') : $t('red.setDefault') }}</el-button>
          </template>
          <template v-slot:header>
            {{$t('common.operation')}}
            <el-popover
              placement="top-start"
              width="200"
              trigger="hover"
              :content="$t('frozen.usingTheDefaultTemplate')"
            >
              <i slot="reference" class="el-icon-question" />
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="templateName" :label="$t('frozen.templateTriggerName')" align="center" />
        <el-table-column v-for="(item, index) of languageOptions" :key="index" prop="successNum" :label="$t('frozen.templateContent', {language: item.language})" align="center">
          <template slot-scope="scope">
            {{ getDesc(scope.row, item) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :title="$t('frozen.addedTheWithdrawalDescriptionTemplate')" :visible.sync="show" width="800px" top="5vh">
      <el-form ref="form" :model="form" :rules="rules" class="demo-form-inline" label-width="200px">
        <el-form-item :label="$t('frozen.templateTriggerName')" prop="templateName">
          <el-input v-model="form.templateName" clearable />
        </el-form-item>
        <el-form-item v-for="(item, index) of languageOptions" :key="index" :label="$t('frozen.templateContent', {language: item.language})" :prop="item.key">
          <el-input v-model="form[item.key]" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="add">{{$t('common.sure')}}</el-button>
        <el-button @click="show = false">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="$t('frozen.resultOfEnforcement')" :visible.sync="visible" width="1000px" top="5vh">
      <div>
        <h3>{{$t('frozen.cancellationResult')}}</h3>
        <el-table border class="top" :data="tableDataCancel" style="width: 100%">
          <el-table-column prop="totalNum" :label="$t('frozen.totalNumberOfWithdrawalOrders')" align="center" />
          <el-table-column prop="successNum" :label="$t('frozen.cancellationResult')" align="center">
            <template slot-scope="scope">
              {{$t('frozen.result', {successNum: scope.row.successNum, failNum: scope.row.failNum})}}
            </template>
          </el-table-column>
          <el-table-column prop="failNum" :label="$t('frozen.downloadCancellationExecutionFailureDelegate')" align="center" width="350px">
            <template slot-scope="scope">
              <el-button v-show="+scope.row.failNum > 0" type="primary" @click="downexcel(scope.row.failExcel)">{{$t('frozen.downloadFailureRecord')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="tableDataFrozen && tableDataFrozen.length > 0">
        <h3>{{$t('frozen.freezeExecutionResults')}}</h3>
        <el-table border class="top" :data="tableDataFrozen" style="width: 100%">
          <el-table-column prop="totalNum" :label="$t('frozen.totalFrozenExecution')" align="center" />
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
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="visible = false">{{$t('common.sure')}}</el-button>
        <el-button @click="visible = false">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { uploadCancelExcel, getBatchCancelRecord, getBatchCancelExcel, templateList, changeTemplateStatus, addTemplate } from '@/api/order'
import { listConfig } from '@/api/system/languageconfig'

export default {
  name: 'Tool',
  data() {
    return {
      show: false,
      recordData: '',
      languageOptions: [],
      tableData: [],
      tableDataFrozen: [],
      tableDataCancel: [],
      visible: false,
      batchParams: {
        fileName: this.$t('financemanager.unselectedFile')
      },
      params: {
        pageNum: 1,
        pageSize: 100
      },
      form: {
        templateName: ''
      },
      timer: null
    }
  },
  computed: {
    rules() {
      const rule = {
        templateName: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' },
          { validator: this.nameValid, trigger: 'blur' }
        ]
      }
      this.languageOptions.forEach(item => {
        rule[item.key] = [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ]
      })
      return rule
    }
  },
  created() {
    this.getBatchCancelRecord()
    this.getLanguageselect()
    this.list()
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    nameValid(rule, value, callback) {
      // 16个英文或数字，如果配置有重复，在输入框失去焦点时，toast提示“活动id重复”
      if (new RegExp(/[^0-9a-zA-Z]/).test(value)) {
        callback(new Error(this.$t('frozen.theTemplateNameCanContainOnlyDigitsOrEnglishCharacters')))
      } else {
        callback()
      }
    },
    changeTemplateStatus(row) {
      changeTemplateStatus({ id: row.id, status: row.status === 0 ? 1 : 0 }).then(res => {
        this.$message({
          type: 'success',
          message: this.$t('common.modifySuccess')
        })
        this.list()
      })
    },
    getDesc(row, item) {
      const temp = row.templateContentList.find(el => el.code === item.key)
      return temp && temp.desc
    },
    list() {
      templateList(this.params).then(res => {
        this.tableData = res.rows
      })
    },
    add() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = {
            templateName: this.form.templateName,
            templateContentList: []
          }
          Object.keys(this.form).forEach(item => {
            if (item !== 'templateName') {
              params.templateContentList.push({ code: item, desc: this.form[item] })
            }
          })
          addTemplate(params).then(res => {
            this.$message({
              type: 'success',
              message: this.$t('common.addSuccess')
            })
            this.show = false
            this.form.templateName = ''
            this.formatForm()
            this.list()
          })
        }
      })
    },
    formatForm() {
      this.languageOptions.forEach(item => {
        this.$set(this.form, item.key, '')
      })
    },
    getLanguageselect() {
      listConfig().then((response) => {
        this.languageOptions = response.rows
        this.formatForm()
      })
    },
    downexcel(url) {
      this.download(url)
    },
    // 获取冻结进度
    async getBatchCancelRecord() {
      const { data } = await getBatchCancelRecord()
      // 0:进行中 1:处理完成， 当状态值为1 时 ，调用获取失败excel 接口
      this.recordData = data
      if (data && data.status === 1) {
        getBatchCancelExcel({ batchNo: data.batchNo }).then(res => {
          this.visible = true
          this.tableDataFrozen = res.data.frozenResult && [res.data.frozenResult]
          this.tableDataCancel = res.data.cancelResult && [res.data.cancelResult]
        })
      }
      if (data && data.status === 0 && !this.timer) {
        this.timer = setInterval(() => {
          if (!this.recordData || this.recordData.status !== 0) {
            clearInterval(this.timer)
            this.timer = null
          } else {
            this.getBatchCancelRecord()
          }
        }, 5000)
      }
    },
    // 文件选择
    handleChange(file) {
      console.log('上传的文件', file)
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
      this.$confirm(this.$t('frozen.areYouSureYouWantToDoThis'), this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        uploadCancelExcel(this.batchParams).then(res => {
          this.batchParams.file = ''
          this.batchParams.fileName = this.$t('financemanager.unselectedFile')
          this.$message({
            type: 'success',
            message: this.$t('common.uploadSucceeded')
          })
          setTimeout(() => {
            this.getBatchCancelRecord()
          }, 1000)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('frozen.cancelSuccess')
        })
      })
    },
    down() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/batchCancelOrderTemplate.xlsx')
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.batch-freeze {
  display: flex;
  .text {
    margin-left: 10px;
    margin-right: 30px;
  }
  .explain {
    margin-left: 30px;
    width: 500px;
    align-self: flex-start;
    border: 1px solid #e4e1e1;
    color: #858181;
    padding: 10px;
  }
}
</style>
