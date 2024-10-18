<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item :label="$t('common.accountType')" prop="uid">
        <el-select
          v-model="queryParams.uid"
          clearable
          size="mini"
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
          v-model="queryParams.currency"
          clearable
          size="mini"
          placeholder="请选择币种"
        >
          <el-option
            v-for="(item, index) in marList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" label-width="60px" prop="ctime">
        <el-date-picker
          v-model="queryParams.ctime"
          size="mini"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
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
    <el-table v-loading="loading" :data="tableList" border>
      <el-table-column label="账户ID" align="center" prop="uid" />
      <el-table-column label="日期" align="center" prop="ctime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号类型" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in typeList" :key="index">
            <span v-if="item.value == scope.row.uid">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column label="可用余额" align="center" prop="balance" />
      <el-table-column :label="$t('common.operation')" align="center" width="310px">
        <template
          v-if="scope.row.uid != 1 && scope.row.uid != 7 && scope.row.uid != 10"
          slot-scope="scope"
        >
          <el-button
            size="small"
            type="text"
            :disabled="isSameDate(scope.row.mtime)"
            :style="{
              color: isSameDate(scope.row.mtime) ? '#C0C4CC' : '#67C23A',
            }"
            @click="handleProfit(scope.row)"
          >申请提取利润</el-button>
          <el-button
            size="small"
            type="text"
            :disabled="isSameDate(scope.row.mtime)"
            @click="handleBalance(scope.row)"
          >申请增加余额</el-button>
          <el-button
            size="small"
            type="text"
            :disabled="isSameDate(scope.row.mtime)"
            @click="handleRecord"
          >查看变更记录</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="load"
    />
    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('common.accountType')" prop="uid">
          <el-select v-model="form.uid" style="width: 100%" disabled>
            <el-option
              v-for="(item, index) in typeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.coin')" prop="currency">
          <el-select v-model="form.currency" style="width: 100%" disabled>
            <el-option
              v-for="(item, index) in marList"
              :key="index"
              :label="item.label"
              :value="item.marginCoin"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可用余额" prop="balance">
          <el-input v-model="form.balance" disabled />
        </el-form-item>
        <el-form-item :label="fromTitle" prop="amount">
          <el-input v-model="form.amount" />
        </el-form-item>
        <el-form-item :label="toTitle" prop="account">
          <el-select v-model="form.account" style="width: 100%">
            <el-option
              v-for="(item, index) in accountList"
              :key="index"
              :label="item.account + '(' + item.name + ')'"
              :value="item.account"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作备注" prop="applyRemark">
          <el-input
            v-model="form.applyRemark"
            type="textarea"
            rows="4"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="unSubmit"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { balanceOfSystemList } from '@/api/contract/systembalance'
import { listCoinMar } from '@/api/contract/margin'
import { financialAccountList, apply } from '@/api/contract/accountConfirm'
export default {
  name: '',

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
      // 遮罩层
      loading: true,
      total: 0,
      title: undefined,
      open: false,
      type: undefined,
      fromTitle: undefined,
      toTitle: undefined,
      unSubmit: false,
      form: {},
      // 总条数
      tableList: [],
      marList: [],
      accountList: [],
      // 查询参数
      queryParams: {
        uid: undefined,
        currency: undefined,
        ctime: undefined,
        pageNum: 1,
        pageSize: 20
      },
      rules: {
        amount: [
          { required: true, message: this.$t('contractmanager.amountCannotBeEmpty'), trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ],
        account: [{ required: true, message: '账户不能为空', trigger: 'blur' }]
      },
      typeList: [
        { value: 1, label: '划转记账账户' },
        { value: 2, label: '平仓账户' },
        { value: 3, label: '手续费账户' },
        { value: 4, label: '资金费用账户' },
        { value: 5, label: '隔夜费账户' },
        { value: 6, label: '营销账户' },
        { value: 7, label: '相互保资金' },
        { value: 8, label: '相互保收益' },
        { value: 9, label: '返佣消耗' },
        { value: 10, label: '兑换账户' },
        { value: 11, label: '回购账户' }
      ]
    }
  },
  created() {
    this.load()
    this.getMarList()
    this.getAccountList()
  },
  methods: {
    load() {
      this.loading = true
      balanceOfSystemList(this.queryParams).then((response) => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 财务账户
    getAccountList() {
      financialAccountList().then((res) => {
        this.accountList = res.rows
      })
    },
    // 保证金币种
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            this.marList = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    reset() {
      this.form = {}
      this.resetForm('form')
    },
    cancel() {
      this.open = false
      this.reset()
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        this.unSubmit = true
        if (valid) {
          const data = {
            transferType: this.type,
            sysAcct: this.form.uid,
            uid: this.form.account,
            currency: this.form.currency,
            amt: this.form.amount,
            applyRemark: this.form.applyRemark
          }
          apply(data)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess('申请成功')
                this.open = false
                this.load()
              } else {
                this.msgError(response.msg)
              }
              this.unSubmit = false
            })
            .catch((e) => {
              this.unSubmit = false
              console.log(e)
            })
        }
      })
    },
    handleQuery() {
      this.load()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.load()
    },
    handleProfit(row) {
      this.title = '申请提取利润'
      this.fromTitle = '提取金额'
      this.toTitle = '提取至'
      this.open = true
      this.type = 1
      this.form = Object.assign({}, row)
      this.$set(this.form, 'account', this.accountList[0].account)
    },
    handleBalance(row) {
      this.title = '申请增加余额'
      this.fromTitle = '增加金额'
      this.toTitle = '资金来源'
      this.open = true
      this.type = 2
      this.form = Object.assign({}, row)
      this.$set(this.form, 'account', this.accountList[0].account)
    },
    handleRecord() {
      this.$router.push({ name: 'accountRecord' })
    },
    isSameDate(date) {
      const now = new Date()
      const time = new Date(date)
      const isSameYear = now.getFullYear() === time.getFullYear()
      const isSameMonth =
        isSameYear && now.getMonth() + 1 === time.getMonth() + 1
      const isSameDate = isSameMonth && now.getDate() === time.getDate()
      return !isSameDate
    }
  }
}
</script>

<style scoped>
</style>
