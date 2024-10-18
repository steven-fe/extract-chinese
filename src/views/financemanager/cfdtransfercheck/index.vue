<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="80px"
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
          size="mini"
          clearable
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
          size="mini"
          placeholder="请选择空投账户"
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
        >查询</el-button>
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
          type="success"
          :disabled="
            queryParams.approvalStatus != 0 && queryParams.approvalStatus != 4
          "
          icon="el-icon-plus"
          size="mini"
          @click="handleBatchCheck(1)"
        >按条件通过</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          :disabled="
            queryParams.approvalStatus != 0 && queryParams.approvalStatus != 4
          "
          icon="el-icon-edit"
          size="mini"
          @click="handleBatchCheck(2)"
        >按条件驳回</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" border :data="tableList">
      <el-table-column
        label="空投批次"
        align="center"
        prop="batchNo"
        width="180px"
      />
      <el-table-column :label="$t('dwmanager.userUID')" align="center" prop="toUid" />
      <el-table-column
        label="空投账户"
        align="center"
        prop="airdropAccountType"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.airdropAccountType == 1">钱包账户</span>
          <span v-if="scope.row.airdropAccountType == 2">合约账户</span>
        </template>
      </el-table-column>
      <el-table-column label="空投币种" align="center" prop="currency" />
      <el-table-column label="空投数量" align="center" prop="amount" />
      <el-table-column label="空投备注" align="center" prop="meta" />
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
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template
          v-if="scope.row.approvalStatus == 0 || scope.row.approvalStatus == 4"
          slot-scope="scope"
        >
          <el-button
            size="mini"
            type="text"
            @click="handleCheck(scope.row, 1)"
          >通过</el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleCheck(scope.row, 2)"
          >驳回</el-button>
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

    <!-- 审核 -->
    <el-dialog :title="title" :visible.sync="open" width="650px">
      <el-form ref="form" :model="form" label-width="130px">
        <el-row :gutter="10" class="mb8">
          <el-col :span="12">
            <el-form-item label="币种：" prop="currency">
              <span>{{ form.currency }}</span>
            </el-form-item>
            <el-form-item label="空投金额：" prop="amount">
              <span>{{ form.amount }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="空投UID：" prop="toUid">
              <span>{{ form.toUid }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="空投备注：" prop="meta">
          <span>{{ form.meta }}</span>
        </el-form-item>
      </el-form>
      <div class="footer">
        <span class="tips">
          确定要
          <span
            v-if="this.form.handleType == 1"
            style="color: green"
          >通过</span>
          <span v-if="this.form.handleType == 2" style="color: red">驳回</span>并执行这条空投记录吗？
        </span>
        <div>
          <el-button
            v-if="this.form.handleType == 1"
            type="success"
            :disabled="disabled"
            @click="submitForm"
          >审核通过</el-button>
          <el-button
            v-if="this.form.handleType == 2"
            type="danger"
            :disabled="disabled"
            @click="submitForm"
          >审核驳回</el-button>
          <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 批量审核 -->
    <el-dialog :title="batchtitle" :visible.sync="batchopen" width="650px">
      <div class="footer">
        <span class="tips">
          确定要
          <span v-if="this.handleType == 1" style="color: green">通过</span>
          <span v-if="this.handleType == 2" style="color: red">驳回</span>
          并执行符合条件的{{ total }}条空投记录吗？
        </span>
        <div>
          <el-button
            v-if="this.handleType == 1"
            type="success"
            :disabled="disabled"
            @click="submitForm"
          >审核通过</el-button>
          <el-button
            v-if="this.handleType == 2"
            type="danger"
            :disabled="disabled"
            @click="submitForm"
          >审核驳回</el-button>
          <el-button @click="cancelbatch">{{ $t('common.cancel') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listTransfer,
  getTransfer,
  editTransfer
} from '@/api/finance/cfdtransferbatch'
import { listSupportTokenByType } from '@/api/coin'
export default {
  data() {
    return {
      open: false,
      batchopen: false,
      form: {},
      // 弹出层标题
      title: '',
      batchtitle: '',
      disabled: false,
      loading: true,
      tableList: [],
      fromAccount: undefined,
      toAccount: undefined,
      total: 0,
      queryParams: {
        airdropAccountType: 1,
        toUid: undefined,
        pageNum: 1,
        batchNo: undefined,
        currency: undefined,
        pageSize: 10,
        approvalStatus: 0,
        meta: undefined
      },
      handleType: undefined,
      coinList: [],
      typeList: [
        { label: '钱包账户', value: 1 },
        { label: '合约账户', value: 2 }
      ],
      approvalStatusList: [
        { value: 0, label: '待审核' },
        { value: 1, label: '审核中' },
        { value: 2, label: '审核通过' },
        { value: 3, label: '审核拒绝' },
        { value: 4, label: '审核失败' }
      ]
    }
  },
  created() {
    this.getList()
    this.getCoinList()
  },
  methods: {
    getList() {
      this.loading = true
      listTransfer(this.queryParams)
        .then((response) => {
          if (response.code == 200) {
            this.tableList = response.rows
            this.tableList.forEach((element) => {
              this.$set(
                element,
                'airdropAccountType',
                this.queryParams.airdropAccountType
              )
            })
            this.total = response.total
            this.loading = false
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
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
    handleCheck(row, handleType) {
      this.reset()
      this.disabled = false
      const id = row.id
      const type = row.airdropAccountType
      getTransfer(id, type).then((response) => {
        this.form = response.data
        this.form.airdropAccountType = type
        this.open = true
        this.form.handleType = handleType
        this.title = handleType == 1 ? '审核通过' : '审核驳回'
      })
    },
    handleBatchCheck(handleType) {
      this.form.id = undefined
      this.disabled = false
      this.handleType = handleType
      this.batchopen = true
      this.batchtitle = handleType == 1 ? '批量通过' : '批量驳回'
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        currency: undefined,
        from: undefined,
        to: undefined,
        amount: undefined,
        meta: undefined,
        airdropAccountType: undefined
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
    cancelbatch() {
      this.batchopen = false
      this.resetQuery()
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
    submitForm() {
      let data
      this.disabled = true
      if (this.form.id != undefined) {
        data = this.form
      } else {
        data = this.queryParams
        this.$set(data, 'handleType', this.handleType)
      }
      editTransfer(data)
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess('审核成功')
            this.open = false
          } else {
            this.msgError(response.msg)
          }
          this.open = false
          this.batchopen = false
          this.disabled = false
          this.reset()
          this.getList()
        })
        .catch((error) => {
          this.disabled = false
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>
.footer {
  display: flex;
  flex-flow: column;
  align-items: center;
}
.footer .tips {
  margin-bottom: 30px;
  font-size: 18px;
}
</style>
