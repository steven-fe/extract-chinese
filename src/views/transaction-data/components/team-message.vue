<template>
  <div>
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="团队名" prop="name">
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
          <el-button type="primary" size="mini">导入虚拟UID</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="downLoad">下载导入模板</el-button>
      </el-form-item>
    </el-form>

    <p style="text-align:right;color:red;font-weight:bold;">最近一次刷新时间 {{ parseTime(lastUpdateTime) }}</p>
    <el-table :data="teamDataList" border>
      <el-table-column :label="$t('common.operation')" align="center" min-width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleOpenMemberData(scope.row)">团员数据</el-button>
        </template>
      </el-table-column>
      <el-table-column label="排行" align="center" prop="rank" min-width="150" />
      <el-table-column label="团队名" align="center" prop="teamName" min-width="150" />
      <el-table-column label="团队ID" align="center" prop="id" min-width="150" />
      <el-table-column label="团队人数" align="center" prop="nums" min-width="150" />
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
      @pagination="getTeamDataList"
    />

    <el-dialog :title="memberDataTitle" :visible.sync="memberDataVisible" :close-on-click-modal="false" width="1200px">
      <div :class="$style.mb">
        <el-button type="primary" size="mini" @click="handleExportUsers">导出列表</el-button>
        <el-button type="primary" size="mini" @click="handleAddVirtualUid">添加虚拟UID</el-button>
      </div>
      <el-table :data="memberMsgList" border>
        <el-table-column label="UID" align="center" prop="uid" min-width="150" />
        <el-table-column label="身份" align="center" prop="userType" min-width="150" />
        <el-table-column label="真实交易额" align="center" prop="tradeAmt" min-width="150" />
        <el-table-column label="虚增交易额" align="center" prop="virtualAmt" min-width="150" />
        <el-table-column label="最终交易额" align="center" prop="totalAmt" min-width="150" />
        <el-table-column label="当前个人排名" align="center" prop="rank" min-width="150" />
        <el-table-column :label="$t('common.operation')" align="center" min-width="150">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="openShamTurnover(scope.row)">虚增交易额</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

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
        <el-button type="primary" size="mini" @click="handleShamAddAmount">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加虚拟UID" :visible.sync="addVirtualUidVisible" :close-on-click-modal="false" width="600px" @closed="addVirtualUidDialogClosed">
      <el-form ref="addVirtualUidForm" :model="addVirtualUidForm" label-width="92px" label-position="left" :rules="rules1">
        <el-form-item label="虚拟UID" prop="uids">
          <el-input v-model="addVirtualUidForm.uids" type="textarea" rows="5" placeholder="多个UID同时输入，用英文逗号分隔" @input="inputHandler" />
          <div :class="$style.tipText">多个UID之间用英文","隔开</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="addVirtualUidVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleAddUID">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="addVirtualUidResult" :close-on-click-modal="false" width="400px">
      <div :class="$style.mb">上传完成</div>
      <div :class="$style.mb">成功上传：{{ successCount1 }}</div>
      <div :class="$style.mb">失败：{{ failCount1 }}</div>
      <el-table :data="resultList" border>
        <el-table-column label="虚拟UID" align="center" prop="uid" min-width="150" />
        <el-table-column :label="$t('financemanager.causeOfFailure')" align="center" prop="msg" min-width="150" />
      </el-table>
    </el-dialog>

    <el-dialog title="导入虚拟UID" :visible.sync="importUidDialog" width="500px" :close-on-click-modal="false">
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
import { getTeamList, teamExport, importUid, getTeamUsers, addAmt, addUid, exportUsers, exportFail } from '@/api/theme-trading-contest'
export default {
  name: 'TeamMessage',
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
        name: '',
        competitionId: this.id
      },
      teamDataList: [],
      lastUpdateTime: Date.now(),
      total: 0,
      memberDataTitle: '',
      memberDataVisible: false,
      memberMsgList: [],
      shamTurnoverVisible: false,
      finalTurnover: '',
      amtForm: {
        amount: ''
      },
      addVirtualUidVisible: false,
      addVirtualUidForm: {
        uids: ''
      },
      teamId: '',
      addVirtualUidResult: false,
      successCount1: '',
      failCount1: '',
      resultList: [],
      memberId: '',
      importUidDialog: false,
      fileName: '',
      successCount: '',
      failCount: '',
      failType: '', // 1 导入UID 2 导入虚增金额
      batchNumber: '',
      rules: {
        amount: [{ required: true, message: '请输入虚增交易额', trigger: 'blur' }]
      },
      rules1: {
        uids: [{ required: true, message: '请输入虚增交易额', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getTeamDataList()
  },
  methods: {
    async getTeamDataList() {
      const { data, total, rows } = await getTeamList(this.queryParams)
      this.teamDataList = rows
      this.total = total
      this.lastUpdateTime = data.rankTime
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getTeamDataList()
    },
    async handleExport() {
      const { competitionId, name } = this.queryParams
      const { msg } = await teamExport({ competitionId: competitionId, name: name })
      this.download(msg)
    },
    handleChange(data) {
      this.fileName = data.name
      const params = {
        file: data.raw,
        competitionId: this.id
      }
      importUid(params).then(res => {
        if (res.code === 200) {
          this.successCount = res.data.successCount
          this.failCount = res.data.failCount
          this.batchNumber = res.data.batchNumber
          this.failType = res.data.failType
          this.importUidDialog = true
          this.getTeamDataList()
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
        this.importUidDialog = false
        this.getTeamDataList()
      })
    },
    // 下载模版
    downLoad() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/competitionTopicTeamTemplate.xls')
    },
    addVirtualUidDialogClosed() {
      this.addVirtualUidVisible = false
      this.$refs['addVirtualUidForm'].resetFields()
    },
    shamTurnoverDialogClosed() {
      this.shamTurnoverVisible = false
      this.$refs['amtForm'].resetFields()
    },
    inputHandler() {
      this.addVirtualUidForm.uids = this.addVirtualUidForm.uids.replace(/，/, ',')
    },
    async handleOpenMemberData(row) {
      this.teamId = row.id
      this.memberDataTitle = `【${row.teamName}】团员信息`
      this.getTeamUsers()

      this.memberDataVisible = true
    },
    getTeamUsers() {
      getTeamUsers({ id: this.teamId }).then(res => {
        if (res.code === 200) {
          this.memberMsgList = res.data
        }
      })
    },
    async handleExportUsers() {
      const { msg } = await exportUsers({ id: this.teamId })
      this.download(msg)
    },
    openShamTurnover(row) {
      this.finalTurnover = row.totalAmt
      this.memberId = row.id
      this.shamTurnoverVisible = true
    },
    handleAddVirtualUid() {
      this.addVirtualUidVisible = true
    },
    handleAddUID() {
      this.$refs['addVirtualUidForm'].validate((valid) => {
        if (valid) {
          const params = {
            uids: this.addVirtualUidForm.uids,
            competitionId: this.id,
            teamId: this.teamId
          }
          addUid(params).then(res => {
            this.successCount1 = res.data.successCount
            this.failCount1 = res.data.failCount
            this.resultList = res.data.failDataList
            this.msgSuccess(this.$t('common.operationSucceed'))
            this.getTeamUsers()
            this.getTeamDataList()
            this.addVirtualUidVisible = false
            this.addVirtualUidResult = true
          })
        }
      })
    },
    handleShamAddAmount() {
      this.$refs['amtForm'].validate((valid) => {
        if (valid) {
          const params = {
            id: this.memberId,
            amount: this.amtForm.amount
          }
          addAmt(params).then(res => {
            this.msgSuccess(this.$t('common.operationSucceed'))
            this.getTeamUsers()
            this.getTeamDataList()
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
.mb {
  margin-bottom: 10px;
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
