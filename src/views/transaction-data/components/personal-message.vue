<template>
  <div>
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="UID" prop="uid">
        <el-input v-model="queryParams.uid" size="mini" clearable :placeholder="$t('frozen.pleaseEnterUID')" />
      </el-form-item>
      <el-form-item label="所在团" prop="name">
        <el-input v-model="queryParams.name" size="mini" clearable placeholder="请输入团队名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">查找</el-button>
        <el-button type="primary" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
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
          <el-button type="primary" size="mini">导入虚增数据</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="downLoad">下载导入模板</el-button>
      </el-form-item>
    </el-form>

    <p style="text-align:right;color:red;font-weight:bold;">最近一次刷新时间 {{ parseTime(lastUpdateTime) }}</p>
    <el-table :data="personalDataList" border>
      <el-table-column :label="$t('common.operation')" align="center" min-width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="openShamTurnover(scope.row)">虚增交易额</el-button>
        </template>
      </el-table-column>
      <el-table-column label="排行" align="center" prop="rank" min-width="150" />
      <el-table-column label="UID" align="center" prop="uid" min-width="170" />
      <el-table-column label="类型" align="center" prop="userType" min-width="150" />
      <el-table-column label="所在团" align="center" prop="teamName" min-width="150" />
      <el-table-column label="真实交易额" align="center" prop="tradeAmt" min-width="150" />
      <el-table-column label="虚增交易额" align="center" prop="virtualAmt" min-width="150" />
      <el-table-column label="最终交易额" align="center" prop="totalAmt" min-width="150" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :class="$style.pagination"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getPersonalDataList"
    />

    <el-dialog title="虚增交易额" :visible.sync="shamTurnoverVisible" :close-on-click-modal="false" width="600px" @closed="shamTurnoverDialogClosed">
      <p>当前最终交易额： {{ finalTurnover }}</p>
      <el-form ref="amtForm" :model="amtForm" label-width="92px" label-position="left" :rules="rules">
        <el-form-item label="虚增交易额" prop="amount">
          <el-input v-model="amtForm.amount" type="number">
            <template slot="append">USDT</template>
          </el-input>
        </el-form-item>
        <div :class="$style.tipText">正数增加虚增交易额，负数减少虚增交易额；如果减少的虚增交易额大于原有的虚增交易额，则最终虚增交易额为0</div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="shamTurnoverVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleSure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="导入虚增数据" :visible.sync="importDataDialog" width="500px" :close-on-click-modal="false">
      <span style="font-size: 14px; color: #333;">{{ `${fileName} 已导入` }}</span>
      <el-button v-if="failCount > 0" type="danger" size="mini" style="margin-bottom: 15px;" @click="handleDownloadFailExcel">下载导入失败Excel</el-button>
      <div :class="$style.import">
        <div :class="$style.borderb">
          <div :class="$style.detail">导入成功数量</div>
          <div style="text-align: center;">{{ successCount }}</div>
        </div>
        <div>
          <div :class="$style.detail">导入失败数量</div>
          <div style="text-align: center;">{{ failCount }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getUserList, exportUser, importAmt, exportFail, addAmt } from '@/api/theme-trading-contest'
export default {
  name: 'PersonalMessage',
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: '',
        name: '',
        competitionId: this.id
      },
      personalDataList: [],
      lastUpdateTime: Date.now(),
      total: 0,
      shamTurnoverVisible: false,
      finalTurnover: '',
      amtForm: {
        amount: ''
      },
      memberId: '',
      importDataDialog: false,
      fileName: '',
      successCount: '',
      failCount: '',
      failType: '', // 1 导入UID 2 导入虚增金额
      batchNumber: '',
      rules: {
        amount: [{ required: true, message: '请输入虚增交易额', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getPersonalDataList()
  },
  methods: {
    async getPersonalDataList() {
      const { rows, data, total } = await getUserList(this.queryParams)
      this.total = total
      this.personalDataList = rows
      this.lastUpdateTime = data.rankTime
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getPersonalDataList()
    },
    // 个人信息导出
    async handleExport() {
      const { competitionId, name, uid } = this.queryParams
      const { msg } = await exportUser({ competitionId: competitionId, name: name, uid: uid })
      this.download(msg)
    },
    handleChange(data) {
      this.fileName = data.name
      const params = {
        file: data.raw,
        competitionId: this.id
      }
      importAmt(params).then(res => {
        if (res.code === 200) {
          this.successCount = res.data.successCount
          this.failCount = res.data.failCount
          this.batchNumber = res.data.batchNumber
          this.failType = res.data.failType
          this.importDataDialog = true
          this.getPersonalDataList()
        }
      })
    },
    handleDownloadFailExcel() {
      const params = {
        failType: this.failType,
        batchNumber: this.batchNumber
      }
      exportFail(params).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: '导出成功'
          })
        }
        this.importDataDialog = false
        this.getPersonalDataList()
      })
    },
    // 下载模版
    downLoad() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/competitionTopicPersonalTemplate.xls')
    },
    shamTurnoverDialogClosed() {
      this.shamTurnoverVisible = false
      this.$refs['amtForm'].resetFields()
    },
    openShamTurnover(row) {
      this.finalTurnover = row.totalAmt
      this.memberId = row.id
      this.shamTurnoverVisible = true
    },
    async handleSure() {
      this.$refs['amtForm'].validate((valid) => {
        if (valid) {
          const params = {
            id: this.memberId,
            amount: this.amtForm.amount
          }
          addAmt(params).then(res => {
            this.msgSuccess(this.$t('common.operationSucceed'))
            this.getPersonalDataList()
            this.shamTurnoverVisible = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.pagination {
  :global {
    .el-pagination {
      top: 0;
    }
  }
}
.tipText {
  color: red;
  margin-top: 10px;
  line-height: 20px;
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
</style>
