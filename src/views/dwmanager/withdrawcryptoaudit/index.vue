<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="115px">
      <el-form-item :label="$t('common.coin')" prop="name">
        <el-select
          v-model="queryParams.symbol"
          size="mini"
          filterable
          clearable
          :filter-method="(text) => (formCodeFilterKeyword = text)"
          @visible-change="visible => (!visible && (formCodeFilterKeyword = ''))"
        >
          <el-option :key="-1" value="" label="全部" />
          <el-option
            v-for="item in coinList"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.id }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="登录账号" prop="account">
        <el-input
          v-model="queryParams.account"
          placeholder="请输入登录账号"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户id"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国籍" prop="userId">
        <el-select v-model="queryParams.countryCode" filterable multiple collapse-tags placeholder="请选择国籍">
          <el-option
            v-for="(item,index) in countrys"
            :key="index"
            :label="item.cnName"
            :value="item.dialingCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否存在白名单" prop="whiteUser">
        <el-select v-model="queryParams.whiteUser" filterable clearable>
          <el-option :key="-1" label="全部" value="" />
          <el-option
            v-for="item in whiteUserOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提现额度" prop="largeCashWithdrawals">
        <el-select v-model="queryParams.largeCashWithdrawals" filterable clearable>
          <el-option :key="-1" label="全部" value="" />
          <el-option
            v-for="item in largeCashWithdrawalsOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提现时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item label="TXID" prop="txid">
        <el-input
          v-model="queryParams.txid"
          placeholder="请输入TXID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="提现状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择提现状态" size="mini">
          <el-option
            v-for="item in statuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="到账地址" prop="addressTo">
        <el-input
          v-model="queryParams.addressTo"
          placeholder="请输入到账地址"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="TAG地址标签" prop="tag">
        <el-input
          v-model="queryParams.tag"
          placeholder="请输入TAG地址标签"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
        <el-button type="primary" size="mini" @click="configureAudit">二次提币审核配置</el-button>
        <el-button type="primary" size="mini" @click="configureLark">Lark提醒配置</el-button>
        <el-button type="primary" size="mini" @click="handleJump">财务提币白名单管理</el-button>
      </el-form-item>
      <el-form-item>
        <el-tooltip placement="top">
          <div slot="content">
            目前财务提币包含以下特殊的提币审核内容：<br/>
            1、大额提币审核<br/>
            （1）币种符合大额提币币种；<br/>
            （2）提币额度>=大额提币折合价值；<br/>
            2、小额免审—无需审核<br/>
            （1）用户在财务提币白名单内；<br/>
            （2）用户提币币种符合白名单设置；<br/>
            （3）用户提币未超过小额免审阈值和小额免审单日上限；<br/>
            3、小额免审—需要审核 & 未设置小额免审—需要审核<br/>
            （1）用户在财务提币白名单内；<br/>
            （2）用户提币币种符合白名单设置；<br/>
            （3）用户提币超过小额免审阈值或小额免审单日上限；
          </div>
          <i class="el-icon-info" />
        </el-tooltip>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="cryptoList" border>
      <el-table-column label="操作" align="center" width="260">
        <template slot-scope="scope">
          <el-button
            v-if="[7].includes(scope.row.status)"
            size="mini"
            type="primary"
            @click="handleUpdate(scope.row,1)"
          >通过</el-button>
          <el-button
            v-if="[7].includes(scope.row.status)"
            size="mini"
            type="danger"
            @click="handleEdit(scope.row,2)"
          >拒绝</el-button>
          <el-button v-if="scope.row.whiteUser === 1" size="mini" type="warning" @click="handleDelete(scope.row)">删除白名单</el-button>
        </template>
      </el-table-column>
      <el-table-column label="提现号" align="center" prop="id" />
      <el-table-column label="提现额度" align="center" prop="largeCashWithdrawals">
        <template slot-scope="scope">
          <span v-if="scope.row.largeCashWithdrawals === 0">普通</span>
          <span v-if="scope.row.largeCashWithdrawals === 2">小额免审</span>
          <span v-if="scope.row.largeCashWithdrawals === 1">财务大额</span>
          <span v-if="scope.row.largeCashWithdrawals === 3">财务普通</span>
          <span v-if="scope.row.largeCashWithdrawals === 4">财务免审</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dwmanager.userUID')">
        <template slot-scope="scope">
          <span v-if="scope.row.userId">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.userId }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="登录账号" align="center" prop="account" />
      <el-table-column label="UID是否存在于白名单中" align="center" prop="whiteUser">
        <template slot-scope="scope">
          <span v-if="scope.row.whiteUser === 0">否</span>
          <span v-if="scope.row.whiteUser === 1">是</span>
        </template>
      </el-table-column>
      <el-table-column label="国籍" align="center" prop="country">
        <template slot-scope="scope">
          {{ countrys.find(item => item.dialingCode === scope.row.country) ? countrys.find(item => item.dialingCode === scope.row.country).cnName : '' }}
        </template>
      </el-table-column>
      <el-table-column label="实名认证" align="center" prop="authLevel">
        <template slot-scope="scope">
          <span v-if="scope.row.authLevel === '0'">未认证</span>
          <span v-if="scope.row.authLevel === '1'">初级认证</span>
          <span v-if="scope.row.authLevel === '2'">高级认证</span>
        </template>
      </el-table-column>
      <el-table-column label="客户标签" align="center" prop="userLabel">
        <template slot-scope="scope">
          <span :style="{color: scope.row.userLabelColor}">{{ scope.row.userLabel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="30日交易量" width="100" align="center" prop="thirtyTradeAmount">
        <template slot-scope="scope">
          <span v-if="scope.row.thirtyTradeAmount">{{ scope.row.thirtyTradeAmount }}</span>
          <el-button v-else type="primary" size="small" :loading="scope.row.tradingVolumeLoading" @click="getTradingVolume(scope, 'trading')">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="累计充值" align="center" prop="depositAmount">
        <template slot-scope="scope">
          <span v-if="scope.row.depositAmount">{{ scope.row.depositAmount }}</span>
          <el-button v-else type="primary" size="small" :loading="scope.row.topUpLoading" @click="getTradingVolume(scope, 'topup')">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" />
      <el-table-column label="链名称" align="center" prop="chainName" />
      <el-table-column label="提现时间" align="center" prop="createdAt">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" align="center" prop="payTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.payTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上链时间" align="center" prop="upTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.upTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提现金额" align="center">
        <template slot-scope="scope">
          <span>{{ addLong(scope.row.amount,scope.row.fee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手续费" align="center" prop="fee" />
      <el-table-column label="到账地址" align="center" prop="addressTo" />
      <el-table-column label="TAG地址标签" align="center" prop="tag" />
      <el-table-column label="TXID" align="center" prop="txid" />
      <el-table-column label="提现状态" align="center" prop="status">
        <template slot-scope="scope">
          <span v-for="(item, index) in tablestatuses" :key="index">
            <span v-if="scope.row.status==item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.remarks')" align="center" prop="refuseMsg" />
      <el-table-column label="审核人" align="center" prop="opUserName" />
      <el-table-column label="二次审核人" align="center" prop="auditName" />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog title="拒绝原因" :visible.sync="dialogFormVisible" width="400px">
      <el-form :model="form" label-width="40px">
        <el-form-item label="理由">
          <el-input v-model="form.refuseMsg" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="二次提币审核配置" :visible.sync="configureAuditFormVisible" width="400px">
      <el-form :model="larkConfig" label-width="150px">
        <el-form-item label="二次提币审核币种：">
          <el-input v-model="coinTreeFilterText" placeholder="输入关键字进行过滤" />
          <div style="max-height: 300px; overflow-y: auto;">
            <el-tree
              ref="coinTree"
              node-key="id"
              :data="coinTreeDate"
              :default-checked-keys="auditConfig.auditCurrencies.map(coin => coin.currencyId)"
              :props="{label: 'name'}"
              :filter-node-method="(value, data) => !value || data.name.toLowerCase().includes(value.toLowerCase())"
              default-expand-all
              show-checkbox
              @check="coinTreeCheck"
            />
          </div>
        </el-form-item>
        <el-form-item label="二次提币审核价值：" required>
          <el-input v-model.trim="auditConfig.auditWorth">
            <template slot="append">USDT</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="configureAuditFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="updateAuditConfig">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Lark 提醒配置" :visible.sync="configureLarkFormVisible" width="400px">
      <el-form :model="larkConfig" label-width="150px">
        <el-form-item label="Lark 机器人 Token" required>
          <el-input v-model="larkConfig.larkToken" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="configureLarkFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="updateLarkConfig">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import {
  listCrypto,
  exportCrypto,
  rejectWithdraw,
  acceptWithdraw,
  getAuditConfig,
  setAuditConfig,
  getLarkConfig,
  setLarkConfig,
  deleteWhite
} from '@/api/finance/withdrawcryptoaudit'
import { getRecordsByType } from '@/api/finance/withdrawcrypto'
import { getCountryList } from '@/api/user'

export default {
  name: 'WithDrawCryptoAudit',
  data() {
    return {
      countrys: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 区块链资产提现流水记录表格数据
      cryptoList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      time: undefined,
      dialogFormVisible: false,
      configureAuditFormVisible: false,
      configureLarkFormVisible: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        symbol: '',
        createdAt: undefined,
        updatedAt: undefined,
        txid: undefined,
        status: undefined,
        addressTo: undefined,
        account: undefined,
        beginTime: undefined,
        endTime: undefined,
        countryCode: [],
        tag: undefined,
        whiteUser: '',
        largeCashWithdrawals: ''
      },
      form: {},
      formCodeFilterKeyword: '',
      larkConfig: { larkToken: '' },
      auditConfig: { auditCurrencies: [], auditWorth: null },
      coinTreeFilterText: '',
      statuses: [
        { value: '', label: '全部' },
        { value: 7, label: '待财务审核' },
        { value: 8, label: '财务审核通过' },
        { value: 9, label: '财务审核拒绝' },
        { value: 5, label: '已完成' },
        { value: 6, label: '已撤销' }
      ],
      whiteUserOptions: [
        { value: 1, label: '是'},
        { value: 0, label: '否'}
      ],
      largeCashWithdrawalsOptions: [
        // { value: 0, label: '普通'},
        // { value: 2, label: '小额免审'},
        { value: 1, label: '财务大额'},
        { value: 3, label: '财务普通'},
        { value: 4, label: '财务免审'},
      ],
      tablestatuses: [
        {
          value: -1,
          label: '初始态'
        },
        {
          value: -2,
          label: '异常解冻'
        },
        {
          value: 0,
          label: '未审核'
        },
        {
          value: 1,
          label: '审核通过'
        },
        {
          value: 2,
          label: '审核拒绝'
        },
        {
          value: 3,
          label: '支付中'
        },
        {
          value: 4,
          label: '支付失败'
        },
        {
          value: 5,
          label: '已完成'
        },
        {
          value: 6,
          label: '已撤销'
        },
        {
          value: 7,
          label: '待财务审核'
        },
        {
          value: 8,
          label: '财务审核通过'
        },
        {
          value: 9,
          label: '财务审核拒绝'
        }
      ]
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    coinList() {
      if (!this.formCodeFilterKeyword) return this.currencyList
      return this.currencyList.filter(({ id, name }) => (
        name.toLowerCase().includes(this.formCodeFilterKeyword.toLowerCase()) || String(id).toLowerCase().includes(this.formCodeFilterKeyword.toLowerCase())
      ))
    },
    coinTreeDate() {
      return [{
        id: -1,
        name: '全部',
        children: [...this.currencyList].sort(
          (coin1, coin2) => coin1.name.toLowerCase() === coin2.name.toLowerCase() ? 0 : coin1.name.toLowerCase() > coin2.name.toLowerCase() ? 1 : -1
        )
      }]
    }
  },
  created() {
    this.getCurrency(1)
    this.getList()
    this.countryList()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    async getTradingVolume({ $index, row }, type) {
      if (type === 'trading') {
        const list = [...this.cryptoList]
        list[$index].tradingVolumeLoading = true
        this.cryptoList = list
        try {
          const { data } = await getRecordsByType({
            id: row.id,
            type: 1
          })
          list.tradingVolumeLoading = false
          list[$index].thirtyTradeAmount = data
        } catch (error) {
          console.log(error)
          list.tradingVolumeLoading = false
        }
        this.cryptoList = list
      } else {
        const list = [...this.cryptoList]
        list[$index].topUpLoading = true
        this.cryptoList = list
        try {
          const list = [...this.cryptoList]
          const { data } = await getRecordsByType({
            id: row.id,
            type: 2
          })
          list[$index].topUpLoading = false
          list[$index].depositAmount = data
        } catch (error) {
          console.log(error)
          list[$index].topUpLoading = false
        }
        this.cryptoList = list
      }
    },
    // 国家编码
    countryList() {
      getCountryList()
        .then((response) => {
          if (response.code == 200) {
            this.countrys = response.data
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    /** 查询区块链资产提现流水记录列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listCrypto(this.queryParams).then(response => {
        this.cryptoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    handleEditTure() {
      this.form
      this.form.index
      this.handleUpdate(this.form, this.form.index)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 删除财务提币白名单
    handleDelete(row) {
      this.$confirm('确认要删除这名用户的提币白名单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deleteWhite({ uid: row.userId }).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '已完成白名单删除'
            })
            this.getList()
          } else {
            this.msgError(res.msg)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 更新
    handleUpdate(row, index) {
      const str = index == 1 ? '通过' : '拒绝'
      this.$confirm('确定审核' + str + ', 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          const param = { id: row.id }
          if (index === 1) {
            acceptWithdraw(param)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '审核 ' + str + ' 成功',
                  type: 'success'
                })
                this.getList()
                this.loading = false
                this.dialogFormVisible = false
              })
              .catch(error => {
                this.$message({
                  showClose: true,
                  message: '审核 ' + str + ' 失败',
                  type: 'error'
                })
              })
          } else {
            param.reason = this.form.refuseMsg
            rejectWithdraw(param)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '审核 ' + str + ' 成功',
                  type: 'success'
                })
                this.getList()
                this.loading = false
                this.dialogFormVisible = false
              })
              .catch(error => {
                this.$message({
                  showClose: true,
                  message: '审核 ' + str + ' 失败',
                  type: 'error'
                })
              })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
          this.dialogFormVisible = false
        })
    },

    handleEdit(row, index) {
      this.form = {
        index: undefined
      }
      this.dialogFormVisible = true
      this.form.index = index
      this.form = { ...this.form, ...row }
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportCrypto(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    },
    async configureLark() {
      try {
        const { code, data } = await getLarkConfig() || {}

        if (code !== 200) {
          this.$message({ type: 'error', message: '获取Lark提醒配置失败，请再次尝试' })
          throw new Error('获取Lark提醒配置失败')
        }

        const { larkToken } = data || {}

        this.larkConfig.larkToken = larkToken || ''

        this.configureLarkFormVisible = true
      } catch (e) {
        console.error(e.message)
      }
    },
    handleJump() {
      this.$router.push({name: 'financeWithdrawal'})
    },
    async updateLarkConfig() {
      if (!this.larkConfig.larkToken) return this.$message({ type: 'error', message: '请填写Lark提醒配置信息' })

      try {
        const { code } = await setLarkConfig(this.larkConfig) || {}

        if (code !== 200) {
          this.$message({ type: 'error', message: '更新Lark提醒配置失败，请再次尝试' })
          throw new Error('更新Lark提醒配置失败')
        }

        this.configureLarkFormVisible = false
        this.$message({ type: 'info', message: '更新Lark提醒配置成功' })
      } catch (e) {
        console.error(e.message)
      }
    },
    async configureAudit() {
      try {
        const { code, data } = await getAuditConfig() || {}

        if (code !== 200) {
          this.$message({ type: 'error', message: '获取二次提币审核配置失败，请再次尝试' })
          throw new Error('获取二次提币审核配置失败')
        }

        const { auditCurrencies, auditWorth } = data || {}

        this.auditConfig.auditCurrencies = auditCurrencies || []
        this.auditConfig.auditWorth = auditWorth

        this.configureAuditFormVisible = true
      } catch (e) {
        console.error(e.message)
      }
    },
    coinTreeCheck(_, checkState) {
      this.auditConfig.auditCurrencies = checkState.checkedNodes
        .filter(({ id }) => id !== -1) // exclude node - "all"
        .map(({ id, name }) => ({ currencyId: id, currencyCode: name }))
    },
    async updateAuditConfig() {
      if (!/^\d+(?:\.\d+)?$/.test(this.auditConfig.auditWorth) || +this.auditConfig.auditWorth <= 0) return this.$message({ type: 'error', message: '请填写正确的二次提币审核价值' })

      try {
        const { code } = await setAuditConfig(this.auditConfig) || {}

        if (code !== 200) {
          this.$message({ type: 'error', message: '更新二次提币审核配置失败，请再次尝试' })
          throw new Error('更新二次提币审核配置失败')
        }

        this.configureAuditFormVisible = false
        this.$message({ type: 'info', message: '更新二次提币审核配置成功' })
      } catch (e) {
        console.error(e.message)
      }
    }
  },
  watch: {
    coinTreeFilterText(val) {
      this.$refs.coinTree.filter(val)
    }
  }
}
</script>
