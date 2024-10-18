<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item :label="$t('financemanager.currencyCode')" prop="currencyId">
        <el-select v-model="form.currencyId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="auditStatus">
        <el-select v-model="form.auditStatus" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">{{ $t('common.search') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="code" :label="$t('financemanager.currencyCode')" align="center" />
      <el-table-column prop="chainProtocol" :label="$t('systemsetting.chainType')" align="center" />
      <el-table-column prop="contractAddress" width="100" :label="$t('systemsetting.currencyAddress')" align="center">
        <template slot-scope="scope">
          <a class="colortxt" :href="`${scope.row.chainBrowserAddress}${scope.row.contractAddress}`" target="_blank">{{ scope.row.contractAddress }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="showPrecision" :label="$t('contractmanager.currencyAccuracy')" align="center" />
      <el-table-column prop="depositMin" width="120" :label="$t('systemsetting.text')" align="center" />
      <el-table-column prop="noAuthDay" width="170" :label="$t('systemsetting.text1')" align="center" />
      <el-table-column prop="authLevelLowDay" width="190" :label="$t('systemsetting.text2')" align="center" />
      <el-table-column prop="authLevelHighDay" width="190" :label="$t('systemsetting.text3')" align="center" />
      <el-table-column prop="withdrawFee" width="120" :label="$t('systemsetting.text4')" align="center" />
      <el-table-column prop="transferHeatThreshold" width="120" :label="$t('systemsetting.text5')" align="center" />
      <el-table-column prop="balanceWarningThreshold" width="120" :label="$t('systemsetting.text6')" align="center" />
      <el-table-column prop="hottocoldReserve" width="120" :label="$t('systemsetting.text7')" align="center" />
      <el-table-column prop="hottocoldReserve" width="120" :label="$t('systemsetting.text18')" align="center" />
      <el-table-column prop="gas" width="120" :label="$t('dwmanager.serviceCharge')" align="center" />
      <el-table-column prop="auditStatus" width="120" :label="$t('common.status')" align="center">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</el-button> -->
          <span v-if="scope.row.auditStatus === 'UnAudit'">{{ $t('dbmanager.unreviewed') }}</span>
          <span v-else-if="scope.row.auditStatus === 'Auditing'">{{ $t('contractmanager.toBeReviewed') }}</span>
          <span v-else-if="scope.row.auditStatus === 'Refused'">{{ $t('financemanager.rejected') }}</span>
          <span v-else-if="scope.row.auditStatus === 'Pass'">{{ $t('systemsetting.checked') }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="applyUserId" width="120" :label="$t('systemsetting.submitter')" align="center" />
      <el-table-column prop="auditReport" width="120" :label="$t('systemsetting.causeOfRejection')" align="center" />
      <el-table-column prop="walletDeploy" width="120" :label="$t('systemsetting.walletConfigurationState')" align="center">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">{{ $t('common.delete') }}</el-button> -->
          <span v-if="scope.row.walletDeploy === 'UnDeployed'">{{ $t('systemsetting.notConfigured') }}</span>
          <span v-else-if="scope.row.walletDeploy === 'Deployed'">{{ $t('systemsetting.configured') }}</span>
          <!-- <span v-else-if="scope.row.walletDeploy === 'DeployFail'">钱包部署错误</span> -->
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column width="200" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <!--                <el-popover-->
          <!--                  placement="left"-->
          <!--                  width="600"-->
          <!--                  trigger="manual"-->
          <!--                  v-model="scope.row.visible">-->
          <!--内容-->
          <!--                  <div>-->
          <!-- 币种代码 链类型
                      合约地址 合约精度  币种地址 币种精度
                      单次充币最小值 快速上账确认数
                      单次提币最小值 安全上账确认数
                      单次提币最大值 单日提币最大值(未认证）
                      单日提币最大值(初级认证） 单日提币最大值(高级认证）
                      提币（手续费） 用转热归集阈值
                      余额预警阈值 热转冷预留
                      热转冷阈值 钱包币种名称 -->
          <!-- <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm"> -->
          <!--                    <sb-form :formData="scope.row" :disabled="true" status="audit">-->
          <!--                      <template>-->
          <!--                        <el-button size="mini" @click="modify(scope.row)">{{ $t('common.cancel') }}</el-button>-->
          <!--                        <el-button size="mini" type="primary" @click="Refused(scope.row, '驳回审核', '驳回', 'Refused')">驳 回</el-button>-->
          <!--                        <el-button size="mini" :type="scope.row.auditStatus !== 'Pass' ? 'primary' : ''" @click="Refused(scope.row, '通过审核', '通过', 'Pass')">通 过</el-button>-->
          <!--                      </template>-->
          <!--                    </sb-form>-->
          <!--                  </div>-->
          <!-- 钱包配置状态为 已配置 且审核状态为已审核，就不展示审核按钮。 -->
          <!--                  <el-button v-if="!((scope.row.auditStatus === 'Pass' && scope.row.walletDeploy === 'Deployed') || scope.row.auditStatus === 'UnAudit')" slot="reference" type="primary" size="mini" @click="modify(scope.row)">审核</el-button>-->
          <!--                </el-popover>-->
          <el-button v-if="!((scope.row.auditStatus === 'Pass' && scope.row.walletDeploy === 'Deployed') || scope.row.auditStatus === 'UnAudit')" slot="reference" type="primary" size="mini" @click="modify(scope.row)">{{ $t('systemsetting.audit') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getConfigList"
      />
    </div>
    <el-dialog :title="title" :visible.sync="open" width="500px" center class="dialog">
      {{ $t('common.remarks') }}:<el-input v-model="rejectParam.auditReport" />
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="reject">{{ btnName }}</el-button>
        <el-button size="mini" @click="open = false">{{ $t('common.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('contractmanager.audit')" :visible.sync="editDialog" width="1000px">
      <sb-form :form-data="sbFormData" :disabled="true" status="audit">
        <template>
          <el-button size="mini" @click="editDialog = false">{{ $t('common.cancel') }}</el-button>
          <el-button size="mini" type="primary" @click="Refused(sbFormData, $t('common.rejectedAudit'), $t('usermanage.turnDown'), 'Refused')">{{ $t('usermanage.turnDown') }}</el-button>
          <el-button size="mini" :type="sbFormData.auditStatus !== 'Pass' ? 'primary' : ''" @click="Refused(sbFormData, $t('common.passVerification'), $t('contractmanager.pass'), 'Pass')">{{ $t('contractmanager.pass') }}</el-button>
        </template>
      </sb-form>
    </el-dialog>
  </div>
</template>

<script>
import * as API from '@/api/systemsetting/currencyapply'
import sbForm from './sbForm'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Audit',
  components: {
    sbForm
  },
  data() {
    return {
      sbFormData: {},
      editDialog: false,
      codeOptions: [],
      tableData: [],
      total: 0,
      stateOptions: [
        { label: this.$t('common.all'), value: 'all' },
        { label: this.$t('contractmanager.toBeReviewed'), value: 'Auditing' },
        { label: this.$t('systemsetting.checked'), value: 'Pass' },
        { label: this.$t('financemanager.rejected'), value: 'Refused' }
      ],
      form: {
        currencyId: '',
        auditStatus: 'Auditing',
        pageNum: 1,
        pageSize: 10
      },
      open: false,
      rejectParam: {
        auditReport: '', // 驳回理由
        auditStatus: ''
      },
      cla: '',
      btnName: '',
      title: ''
    }
  },
  computed: {
    ...mapGetters(['uid'])
  },
  created() {
    this.getConfigList()
    this.getCurrencyList()
  },
  methods: {
    // 获取币种代码
    getCurrencyList() {
      API.getCurrencyList().then(res => {
        this.codeOptions = res.data
      })
    },
    getConfigList() {
      const param = Object.assign({}, this.form)
      if (param.auditStatus === 'all') {
        param.auditStatus = undefined
      }
      API.auditList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    modify(row) {
      // row.visible = !row.visible;
      this.editDialog = true
      this.sbFormData = row
    },
    Refused(row, title, btnName, auditStatus) {
      if (auditStatus === 'Pass' && row.auditStatus === 'Pass') {
        return
      }
      this.open = true
      console.log('row', row)
      this.title = title
      this.btnName = btnName
      this.rejectParam.auditStatus = auditStatus
      // 构建驳回参数
      this.rejectParam.id = row.id
      this.rejectParam.userId = this.uid
    },
    reject() {
      if (!this.rejectParam.auditReport) {
        this.msgSuccess(this.$t('dwmanager.remarkCannotBeEmpty'))
        return
      }
      API.audit(this.rejectParam).then(res => {
        if (res.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.getConfigList()
          this.open = false
          this.editDialog = false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.dialog {
  .el-input {
    width: 80%;
  }
}
.colortxt {color: #409eff}
</style>
