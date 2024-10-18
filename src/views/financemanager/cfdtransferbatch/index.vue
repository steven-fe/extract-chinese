<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="75px"
    >
      <el-form-item label="空投批次" prop="batchNo">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批次号"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="approvalStatus">
        <el-select
          v-model="queryParams.approvalStatus"
          placeholder="请选择审批状态"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in approvalStatusList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户UID" prop="toUid">
        <el-input
          v-model="queryParams.toUid"
          placeholder="请输入客户UID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currency">
        <el-select
          v-model="queryParams.currency"
          clearable
          size="mini"
          filterable
          placeholder="请选择币种"
        >
          <el-option
            v-for="(item, index) in coinList"
            :key="index"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="空投备注" prop="meta">
        <el-input
          v-model="queryParams.meta"
          placeholder="请输入空投备注"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="空投账户" prop="airdropAccountType">
        <el-select
          v-model="queryParams.airdropAccountType"
          placeholder="请选择空投账户"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in typeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >空投</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click="handleBatch"
        >批量空投</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="transferList" border>
      <el-table-column
        label="空投批次"
        align="center"
        prop="batchNo"
        width="180px"
      />
      <el-table-column :label="$t('dwmanager.userUID')" align="center" prop="toUid" />
      <el-table-column label="空投账户" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type == 1">钱包账户</span>
          <span v-if="scope.row.type == 2">合约账户</span>
        </template>
      </el-table-column>
      <el-table-column label="空投币种" align="center" prop="currency" />
      <el-table-column label="空投数量" align="center" prop="amount" />
      <el-table-column label="空投备注" align="center" prop="meta">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.meta) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.operator')" align="center" prop="opUid" />
      <el-table-column label="操作时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="approvalUid">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.approvalUid) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.approvalStatus != 0">{{
            parseTime(scope.row.mtime)
          }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center" prop="approvalStatus">
        <template slot-scope="scope">
          <span v-for="(item, index) in approvalStatusList" :key="index">
            <span v-if="item.value == scope.row.approvalStatus">{{
              item.label
            }}</span>
          </span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改合约空投记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="空投账户" prop="airdropAccountType">
          <el-select
            v-model="form.airdropAccountType"
            clearable
            filterable
            style="width: 100%"
            placeholder="请选择账户类型"
          >
            <el-option
              v-for="(item, index) in typeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.coin')" prop="currency">
          <el-select
            v-model="form.currency"
            clearable
            filterable
            style="width: 100%"
            placeholder="请选择币种"
          >
            <el-option
              v-for="(item, index) in coinList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.remarks')" prop="meta">
          <el-input v-model="form.meta" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="客户ID和空投数量" prop="airdropInfo">
          <el-input
            v-model="form.airdropInfo"
            type="textarea"
            :rows="5"
            placeholder="请按规则输入客户ID和空投数量"
          />
        </el-form-item>
        <el-form-item label>
          <span
            style="color: red"
          >请输入uid:数量,uid:数量,uid:数量,多个uid以','分隔,','数据不要大于200条;所有符号都是要英文符号。例如:10001:10,10002:10,10003:10</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :disabled="disabled"
          @click="submitForm"
        >确定空投</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>

    <!-- 批量空投记录对话框 -->
    <el-dialog :title="batchtitle" :visible.sync="batchopen" width="600px">
      <el-upload
        ref="upload"
        accept=".xlsx, .xls"
        :action="uploadUrl"
        :headers="headers"
        :on-exceed="onExceed"
        :file-list="fileList"
        :on-change="onUploadChange"
        :limit="1"
        :on-success="handleFileSuccess"
        :auto-upload="false"
      >
        <el-button
          slot="trigger"
          size="mini"
          type="primary"
        >选取文件</el-button>
        <el-button
          style="margin-left: 10px"
          size="mini"
          type="success"
          @click="downTemplate"
        >{{$t('frozen.downloadTemplate')}}</el-button>
        <div slot="tip" class="el-upload__tip">
          提示：仅允许导入“xls”或“xlsx”格式文件，且数据不超过1000条
        </div>
      </el-upload>
      <div v-if="sheet != null" class="el-upload__tip" style="color: red">
        本次导入包含数据：{{ sheet }}条
      </div>

      <div class="footer">
        <el-button type="primary" @click="submitUpload">确定导入</el-button>
        <el-button @click="batchcancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listTransfer,
  addTransfer,
  uploadTemplate
} from '@/api/finance/cfdtransferbatch'
import { getToken } from '@/utils/auth'
import { listSupportTokenByType } from '@/api/coin'
import XLSX, { read } from 'xlsx'
export default {
  name: 'Transfer',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 合约空投记录表格数据
      transferList: [],
      // 弹出层标题
      title: '',
      batchtitle: '',
      uploadUrl: process.env.VUE_APP_BASE_API + '/coinbull/assets/importData',
      // 是否显示弹出层
      open: false,
      disabled: false,
      batchopen: false,
      // 设置上传的请求头部
      headers: { Authorization: 'Bearer ' + getToken() },
      coinList: [],
      typeList: [
        { label: '钱包账户', value: 1 },
        { label: '合约账户', value: 2 }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        airdropAccountType: 1,
        pageSize: 10,
        tradeNo: undefined,
        fromUid: undefined,
        toUid: undefined,
        currency: undefined,
        amount: undefined,
        exchId: undefined,
        mtime: undefined,
        ctime: undefined,
        hash: undefined,
        meta: undefined,
        opUid: undefined,
        batchNo: undefined,
        batchNum: undefined,
        approvalStatus: undefined,
        approvalUid: undefined
      },
      approvalStatusList: [
        { value: 0, label: '待审核' },
        { value: 1, label: '审核中' },
        { value: 2, label: '审核通过' },
        { value: 3, label: '审核拒绝' },
        { value: 4, label: '审核失败' }
      ],
      fileList: [],
      batchform: {},
      sheet: undefined,
      // 表单参数
      form: {},
      // 表单校验
      batchrules: {},
      rules: {
        currency: [
          { required: true, message: this.$t('financemanager.currencyCannotBeEmpty'), trigger: 'blur' }
        ],
        airdropAccountType: [
          { required: true, message: '账户类型不能为空', trigger: 'blur' }
        ],
        meta: [
          { required: true, message: '空投备注不能为空', trigger: 'blur' }
        ],
        airdropInfo: [
          {
            required: true,
            message: '客户ID和空投数量不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getCoinList()
  },
  methods: {
    /** 查询合约空投记录列表 */
    getList() {
      this.loading = true
      listTransfer(this.queryParams).then((response) => {
        this.transferList = response.rows
        this.transferList.forEach((element) => {
          this.$set(element, 'type', this.queryParams.airdropAccountType)
        })
        this.total = response.total
        this.loading = false
      })
    },
    // 币种列表
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
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    batchcancel() {
      this.batchopen = false
      this.sheet = undefined
      this.$refs.upload.clearFiles()
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.batchcancel()
      if (response.code == 200) {
        this.$alert('导入成功，批次号：' + response.msg, '导入结果', {
          dangerouslyUseHTMLString: true
        })
      } else {
        this.$alert(response.msg, '导入结果', {
          dangerouslyUseHTMLString: true
        })
      }

      this.getList()
    },
    onUploadChange(file, fileList) {
      this.file2Xce(file).then((tabJson) => {
        this.sheet = tabJson[0].sheet.length
      })
    },
    file2Xce(file) {
      return new Promise(function(resolve, reject) {
        const reader = new FileReader()
        reader.onload = function(e) {
          const data = e.target.result
          this.wb = XLSX.read(data, {
            type: 'binary'
          })
          const result = []
          this.wb.SheetNames.forEach((sheetName) => {
            result.push({
              sheetName: sheetName,
              sheet: XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName])
            })
          })
          resolve(result)
        }
        reader.readAsBinaryString(file.raw)
      })
    },
    // 文件上传
    submitUpload() {
      const that = this
      this.$confirm('是否确定要执行本次空投操作吗?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        that.submitFileForm()
      })
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        tradeNo: undefined,
        fromUid: undefined,
        toUid: undefined,
        currency: undefined,
        amount: undefined,
        exchId: undefined,
        mtime: undefined,
        ctime: undefined,
        hash: undefined,
        meta: undefined,
        opUid: undefined,
        batchNo: undefined,
        batchNum: undefined,
        approvalStatus: '0',
        approvalUid: undefined,
        airdropAccountType: undefined
      }
      this.resetForm('form')
    },
    onExceed(files, fileList) {
      this.$set(fileList[0], 'raw', files[0])
      this.$set(fileList[0], 'name', files[0].name)
      this.$refs.upload.clearFiles() // 清除文件
      this.$refs.upload.handleStart(files[0])
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
    handleBatch() {
      this.batchopen = true
      this.sheet = undefined
      this.batchtitle = '批量空投'
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.disabled = false
      this.open = true
      this.title = '空投'
    },
    // 模板下载
    downTemplate() {
      uploadTemplate().then((response) => {
        this.download(response.msg)
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const that = this
          this.disabled = true
          this.$confirm('是否确定要执行本次空投操作吗?', this.$t('common.alert'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          })
            .then(function() {
              addTransfer(that.form)
                .then((response) => {
                  if (response.code === 200) {
                    that.msgSuccess('新增成功')
                    that.open = false
                    that.getList()
                  } else {
                    that.msgError(response.msg)
                  }
                  that.disabled = false
                })
                .catch(function() {
                  that.disabled = false
                })
            })
            .catch(() => {
              this.disabled = false
            })
        }
      })
    }
  }
}
</script>
<style scoped>
.footer {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}
</style>
