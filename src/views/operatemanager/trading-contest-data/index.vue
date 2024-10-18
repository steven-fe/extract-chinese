<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="UID">
        <el-input v-model="queryParams.uid" :placeholder="$t('frozen.pleaseEnterUID')" clearable size="mini" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getList">{{$t('common.search')}}</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">添加UID</el-button>
      </el-form-item>

      <el-form-item>
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :auto-upload="false"
          class="upload-demo"
        >
          <el-button type="primary" size="mini">导入UID</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="downLoad">下载导入UID模板</el-button>
      </el-form-item>
    </el-form>

    <div style="margin-bottom: 20px">
      <i class="el-icon-question" />
      <span class="mini">每次最多批量导入1000个UID,在导入Excel表格后请等待一会,导入成功/失败的数据会通过表格进行回显</span>
    </div>

    <p style="text-align:right;color:red;font-weight:bold;">最近一次刷新时间 {{ parseTime(lastUpdateTime) }}</p>

    <el-table v-loading="loading" :data="dataList" border>
      <el-table-column :label="$t('common.operation')" align="center" width="270" class-name>
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleAddAmt(scope.row)">虚增交易价值</el-button>
        </template>
      </el-table-column>

      <el-table-column label="排行" align="center" prop="rankNum" width="100px" />

      <el-table-column label="UID" align="center" prop="uid" width="200px" />

      <el-table-column label="用户注册时间" align="center" prop="userRegisterTime" width="200px">
        <template slot-scope="scope">
          <span v-if="scope.row.userRegisterTime === '-'">--</span>
          <span v-else>{{ parseTime(scope.row.userRegisterTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="真实交易价值（USDT）" align="center" prop="realAmt" width="300px" />

      <el-table-column label="虚增交易价值（USDT）" align="center" prop="virtualAmt" width="300px" />

      <el-table-column label="最终交易价值（USDT）" align="center" prop="totalAmt" width="300px" />

      <el-table-column label="IP国籍（注册）" align="center" prop="ipCitizenship" width="150px" />

      <el-table-column label="新增KYC国籍" align="center" prop="kycCitizenship" width="150px" />
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="添加UID" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" @closed="formDialogClosed">
      <el-form ref="form" :model="form" :rules="rules" class="demo-form-inline">

        <el-form-item label="UID" :label-width="formLabelWidth" prop="uid" :rules="rules.UID">
          <el-input v-model="form.uid" />
        </el-form-item>

        <el-form-item label="虚增交易价值" :label-width="formLabelWidth" prop="virtualAmt" :rules="rules.virtualAmt">
          <el-input v-model="form.virtualAmt">
            <template slot="append">USDT</template>
          </el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="虚增交易价值" :visible.sync="amtDialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" width="700px" @closed="formDialogClosed">
      <p>当前最终交易价值 {{ amtForm.totalAmt }}   USDT</p>

      <el-form ref="amtForm" :model="amtForm" :rules="rules" class="demo-form-inline">
        <el-form-item label="虚增交易价值" :label-width="formLabelWidth" prop="virtualAmt" :rules="rules.virtualAmt1">
          <el-input v-model="amtForm.virtualAmt" placeholder="正数增加虚增交易价值，负数减少虚增交易价值">
            <template slot="append">USDT</template>
          </el-input>
        </el-form-item>
        <div style="margin-left: 110px">
          <i class="el-icon-question" />
          <span class="mini">减少的虚增交易价值若大于原有的虚增交易价值，则最终虚增交易价值为0</span>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="amtDialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTureForAmt">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="导入UID" :visible.sync="importuidDialog" width="500px" :close-on-click-modal="false">
      <span style="font-size: 14px; color: #333;">{{ `${fileName} 已导入` }}</span>
      <el-button v-if="errorCount > 0" type="danger" size="mini" style="margin-bottom: 15px;" @click="handleDownloadFailExcel">下载导入失败Excel</el-button>
      <div class="import">
        <div class="borderb">
          <div class="detail">导入成功数量</div>
          <div style="text-align: center;">{{ sucCount }}</div>
        </div>
        <div>
          <div class="detail">导入失败数量</div>
          <div style="text-align: center;">{{ errorCount }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTradeData, addUid, addAmt, exportTradeData, batchImport, downloadErrorData } from '@/api/trading-contest'

export default {
  name: 'TradingContestData',
  data() {
    const competitionId = +this.$route.query.id || null

    return {
      queryParams: {
        competitionId,
        uid: '',
        pageNum: 1,
        pageSize: 10
      },
      loading: true,
      total: 0,
      lastUpdateTime: Date.now(),
      dataList: [],
      formLabelWidth: '110px',

      importuidDialog: false,
      fileName: null,
      sucCount: '',
      errorCount: '',
      batchNumber: '',

      dialogFormVisible: false,
      amtDialogFormVisible: false,
      form: { competitionId, uid: '', virtualAmt: '' },
      amtForm: { totalAmt: '', id: '', virtualAmt: '' },
      rules: {
        UID: [{ required: true, message: '请填写UID', trigger: 'blur' }],
        virtualAmt: [
          { required: true, message: '请填写虚增交易价值', trigger: 'blur' },
          { required: true, pattern: /^\+?(?!0+\.?0+$)\d*(?:\.\d+)?$/, message: '请填写大于0的数字', trigger: 'blur' }
        ],
        virtualAmt1: [{ required: true, message: '请填写虚增交易价值', trigger: 'blur' }]
      }
    }
  },
  computed: {
  },
  async created() {
    await this.getList()
  },
  methods: {
    async getList() {
      try {
        this.loading = true
        const res = await getTradeData(this.queryParams)
        this.dataList = res.rows
        this.total = res.total || 0
        this.lastUpdateTime = res.data
      } catch (e) {
        console.error(e)

        this.dataList = []
      } finally {
        this.loading = false
      }
    },

    formDialogClosed() {
      this.form.uid = ''
      this.form.virtualAmt = ''
      this.amtForm.totalAmt = ''
      this.amtForm.id = ''
      this.amtForm.virtualAmt = ''
      this.$refs['form'] && this.$refs['form'].resetFields()
      this.$refs['amtForm'] && this.$refs['amtForm'].resetFields()
    },
    handleAdd() {
      this.dialogFormVisible = true
    },
    handleAddAmt({ id, totalAmt }) {
      this.amtForm.id = id
      this.amtForm.totalAmt = totalAmt
      this.amtDialogFormVisible = true
    },
    handleEditTure() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const form = { ...this.form, virtualAmt: +this.form.virtualAmt }

          addUid(form)
            .then(response => {
              this.$message({
                showClose: true,
                message: '添加成功',
                type: 'success'
              })
              this.dialogFormVisible = false
              this.getList()
            })
            .catch(error => {
              console.log(error)
            })
        }
      })
    },
    handleEditTureForAmt() {
      this.$refs['amtForm'].validate(valid => {
        if (valid) {
          const form = { ...this.amtForm, virtualAmt: +this.amtForm.virtualAmt, totalAmt: null }

          addAmt(form)
            .then(response => {
              this.$message({
                showClose: true,
                message: '添加成功',
                type: 'success'
              })
              this.amtDialogFormVisible = false
              this.getList()
            })
            .catch(error => {
              console.log(error)
            })
        }
      })
    },
    async handleExport() {
      const { competitionId, uid } = this.queryParams
      const { msg } = await exportTradeData({ competitionId, uid })
      this.download(msg)
    },
    // 下载模版
    downLoad() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/competitionUidTemplate.xlsx')
    },
    handleChange(data) {
      this.fileName = data.name
      this.importuidDialog = true
      const params = {
        file: data.raw,
        competitionId: this.$route.query.id
      }
      batchImport(params).then(res => {
        if (res.code === 200) {
          this.sucCount = res.data.sucCount
          this.errorCount = res.data.errorCount
          this.batchNumber = res.data.batchNumber
          this.getList()
        }
      })
    },
    handleDownloadFailExcel() {
      console.log('this.batchNumber', this.batchNumber)
      downloadErrorData(this.batchNumber).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: '导出成功'
          })
        }
        this.importuidDialog = false
        this.getList()
      })
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    .title {
      width: 100%;
      font-size: 20px;
      color: #000;
      margin: 0 0 30px;
      overflow: hidden;
    }

    .el-col {
      margin-right: 10px;
    }
    .el-form-item {
      margin: 0 0 20px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
      text-align: left;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 50% 50%;
      margin-left: 5%;
      .grid-item {
        width: 90%;
      }
    }
    .divide {
      width: 100%;
      overflow: hidden;
      border-top: 1px solid #ccc;
    }
    .el-dialog__footer {
      clear: both;
    }
    .tip {
      width: 100%;
      padding: 0 0 0 120px;
      margin-bottom: 20px;
      overflow: hidden;
    }
  }
  .el-form-item {
    margin: 0 0 15px;
  }
  .el-form-item__content {
    line-height: 30px;
    font-size: 20px;
  }
}

.form-title {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  align-items: center;

  .add-btn {
    color: green;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
  }
}

.upload-img-tips {
  color: #ccc;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}

.dividing-line {
  position: relative;
  height: 30px;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 100%;
    border: 1px dashed #ccc;
    z-index: 3;
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    padding: 0 10px;
    background: #fff;
    transform: translate(-50%, -50%);
    z-index: 4;
  }
}

.editor > ::v-deep .text {
  min-height: 200px;
  height: 200px;
}
.import {
  width: 300px;
  height: 90px;
  display: flex;
  justify-content: space-around;
  border: 1px solid #000;
  margin-top: 20px;
  .borderb {
    border-right: 1px solid #000;
  }
  .detail {
    width: 150px;
    text-align: center;
    border-bottom: 1px solid #000;
    padding: 10px 0;
  }
}
.mini {
  font-size: 14px;
}
</style>
