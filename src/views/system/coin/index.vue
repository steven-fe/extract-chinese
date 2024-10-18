<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" size="mini" @click="add()">添加</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table
      v-loading="loading"
      border
      class="top"
      :data="tableData"
      align="center"
      style="width: 100%"
    >
      <el-table-column
        prop="sort"
        label="排序"
        fixed="left"
        width="50"
        align="center"
      />
      <el-table-column
        fixed="left"
        prop="currency"
        :label="$t('common.coin')"
        width="80"
        align="center"
      />
      <el-table-column prop="coin_icon" label="图标" width="80" align="center">
        <template slot-scope="scope">
          <img
            style="width: 40px; height: 40px"
            :src="scope.row.coin_icon"
            alt
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="contact_address"
        label="合约地址"
        width="160"
        align="center"
      />
      <el-table-column
        prop="paltform"
        label="平台"
        width="80"
        align="center"
      />
      <el-table-column
        prop="deposit_confirm"
        label="充值到账确认数"
        width="160"
        align="center"
      />
      <el-table-column
        prop="mining_deposit_confirm"
        label="矿工奖励充值确认数"
        width="160"
        align="center"
      />
      <el-table-column
        prop="address_len"
        label="地址长度"
        width="80"
        align="center"
      />
      <el-table-column
        prop="regular"
        label="地址校验规则"
        width="160"
        align="center"
      />
      <el-table-column
        prop="is_support_wallet"
        label="是否支持钱包"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.is_support_wallet">支持</span>
          <span v-if="!scope.row.is_support_wallet">不支持</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="is_support_option"
        label="是否支持期权"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.is_support_option">支持</span>
          <span v-if="!scope.row.is_support_option">不支持</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="deposit_open"
        :label="$t('systemsetting.whetherToOpenTheRecharge')"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.deposit_open">开启</span>
          <span v-if="!scope.row.deposit_open">关闭</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="withdraw_open"
        label="是否开放提现"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.withdraw_open">开启</span>
          <span v-if="!scope.row.withdraw_open">关闭</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="is_support_ctc"
        label="是否支持ctc交易"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.is_support_ctc">支持</span>
          <span v-if="!scope.row.is_support_ctc">不支持</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="is_support_cfd"
        label="是否支持差价合约"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.is_support_cfd">支持</span>
          <span v-if="!scope.row.is_support_cfd">不支持</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="is_virtual_coin"
        label="是否是虚拟币"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.is_virtual_coin">是</span>
          <span v-if="!scope.row.is_virtual_coin">否</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="release_status"
        label="上线状态"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.release_status == '1'">沙盒</span>
          <span v-if="scope.row.release_status == '2'">线上</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="token_base"
        :label="$t('systemsetting.currencyType')"
        align="center"
        width="150"
      />
      <el-table-column
        prop="withdrawal_fee"
        label="提现手续费"
        width="150"
        align="center"
      />
      <el-table-column
        prop="enable"
        label="是否可用"
        width="150"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.enable">可用</span>
          <span v-if="!scope.row.enable">不可用</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="lock_position"
        label="净充值锁仓开关"
        width="150"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.lock_position">开</span>
          <span v-if="!scope.row.lock_position">关</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="exempt_amount"
        label="锁仓豁免额"
        width="150"
        align="center"
      />
      <el-table-column
        prop="add_date"
        label="添加时间"
        width="160"
        align="center"
      />
      <el-table-column :label="$t('common.operation')" width="120" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >修改配置</el-button>
          <el-button
            size="mini"
            style="margin: 5px 0"
            @click="handleWP(1, scope.row)"
          >充提配置</el-button>
          <el-button
            size="mini"
            style="margin-left: 0"
            @click="handleWP(2, scope.row)"
          >锁仓配置</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="load()"
      />
    </div>
    <el-dialog title="充提配置" :visible.sync="dialogWPForm" width="1000px">
      <el-form
        ref="formPW"
        :model="formPW"
        :rules="rules"
        class="demo-form-inline"
      >
        <el-row :gutter="20">
          <el-form-item :label="$t('common.coin')" :label-width="formLabelWidth">{{
            formPW.coinSymbol
          }}</el-form-item>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-col :span="24">
              <el-form-item
                label="合约精度"
                prop="contractPrecision"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.contractPrecision"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="单次提现最小值"
                prop="withdrawMin"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.withdrawMin"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="单日提现最大值(初)"
                prop="withdrawMaxDayNoAuth"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.withdrawMaxDayNoAuth"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="vip单次提现最小值"
                prop="withdrawMinVip"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.withdrawMinVip"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-col>
          <el-col :span="8">
            <el-col :span="24">
              <el-form-item
                label="显示精度"
                prop="showPrecision"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.showPrecision"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="单次提现最大值"
                prop="withdrawMax"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.withdrawMax"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="单日提现最大值(高)"
                prop="withdrawMaxDay"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.withdrawMaxDay"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="vip单次提现最大值"
                prop="withdrawMaxVip"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.withdrawMaxVip"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-col>
          <el-col :span="8">
            <el-col :span="24">
              <el-form-item
                label="地址查询浏览器地址"
                prop="chainAddress"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.chainAddress"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="txid查询浏览器地址"
                prop="chainTx"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.chainTx"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="单次充值最小值"
                prop="depositMin"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.depositMin"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="vip单日提现最大值"
                prop="withdrawMaxDayVip"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="formPW.withdrawMaxDayVip"
                  :disabled="disabledPW"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogWPForm = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="handlePWConfigTure"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="币种管理" :visible.sync="dialogFormVisible">
      <el-form
        ref="form"
        :model="form"
        :rules="rules2"
        class="demo-form-inline"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-col :span="22">
              <el-form-item :label="$t('common.coin')" :label-width="formLabelWidth">
                <el-input v-model="form.currency" clearable />
              </el-form-item>
              <el-form-item label="图片" :label-width="formLabelWidth">
                <input
                  v-model="form.file"
                  class="el-input__inner"
                  clearable
                  @click="addImg()"
                >
              </el-form-item>
              <el-form-item label="合约地址" :label-width="formLabelWidth">
                <el-input v-model="form.contact_address" clearable />
              </el-form-item>
              <el-form-item
                label="充值到账确认数"
                :label-width="formLabelWidth"
              >
                <el-input v-model="form.deposit_confirm" clearable />
              </el-form-item>
              <el-form-item
                label="矿工奖励充值确认数"
                :label-width="formLabelWidth"
              >
                <el-input
                  v-model="form.mining_deposit_confirm"
                  clearable
                />
              </el-form-item>
              <el-form-item label="地址长度" :label-width="formLabelWidth">
                <el-input v-model="form.address_len" clearable />
              </el-form-item>
              <el-form-item label="地址校验规则" :label-width="formLabelWidth">
                <el-input v-model="form.regular" clearable />
              </el-form-item>
              <el-form-item label="平台" :label-width="formLabelWidth">
                <el-input v-model="form.paltform" clearable />
              </el-form-item>
              <el-form-item
                label="提现手续费"
                prop="withdrawal_fee"
                :label-width="formLabelWidth"
              >
                <el-input v-model="form.withdrawal_fee" clearable />
              </el-form-item>
              <el-form-item
                label="排序"
                prop="sort"
                :label-width="formLabelWidth"
              >
                <el-input v-model.number="form.sort" clearable />
              </el-form-item>
            </el-col>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否支持otc交易" :label-width="formLabelWidth">
              <el-radio
                v-model="form.is_support_ctc"
                label="0"
              >不支持</el-radio>
              <el-radio v-model="form.is_support_ctc" label="1">支持</el-radio>
            </el-form-item>
            <el-form-item
              label="是否支持差价合约"
              :label-width="formLabelWidth"
            >
              <el-radio
                v-model="form.is_support_cfd"
                label="0"
              >不支持</el-radio>
              <el-radio v-model="form.is_support_cfd" label="1">支持</el-radio>
            </el-form-item>
            <!-- <el-form-item label="是否支持BB交易" :label-width="formLabelWidth">
          <el-radio v-model="form.is_support_bb" label="0">不支持</el-radio>
          <el-radio v-model="form.is_support_bb" label="1">支持</el-radio>
            </el-form-item>-->
            <el-form-item label="是否支持钱包" :label-width="formLabelWidth">
              <el-radio
                v-model="form.is_support_wallet"
                label="0"
              >不支持</el-radio>
              <el-radio
                v-model="form.is_support_wallet"
                label="1"
              >支持</el-radio>
            </el-form-item>
            <el-form-item label="是否支持期权" :label-width="formLabelWidth">
              <el-radio
                v-model="form.is_support_option"
                label="0"
              >不支持</el-radio>
              <el-radio
                v-model="form.is_support_option"
                label="1"
              >支持</el-radio>
            </el-form-item>
            <el-form-item
              v-show="form.is_support_wallet == 1"
              :label="$t('systemsetting.whetherToOpenTheRecharge')"
              :label-width="formLabelWidth"
            >
              <el-radio v-model="form.deposit_open" label="0">关闭</el-radio>
              <el-radio v-model="form.deposit_open" label="1">开启</el-radio>
            </el-form-item>
            <el-form-item
              v-show="form.is_support_wallet == 1"
              label="是否开放提现"
              :label-width="formLabelWidth"
            >
              <el-radio v-model="form.withdraw_open" label="0">关闭</el-radio>
              <el-radio v-model="form.withdraw_open" label="1">开放</el-radio>
            </el-form-item>
            <el-form-item label="是否是虚拟币" :label-width="formLabelWidth">
              <el-radio v-model="form.is_virtual_coin" label="0">否</el-radio>
              <el-radio v-model="form.is_virtual_coin" label="1">是</el-radio>
            </el-form-item>
            <el-form-item label="上线状态" :label-width="formLabelWidth">
              <el-radio v-model="form.release_status" label="1">沙盒</el-radio>
              <el-radio v-model="form.release_status" label="2">线上</el-radio>
            </el-form-item>
            <el-form-item :label="$t('systemsetting.currencyType')" :label-width="formLabelWidth">
              <el-select
                v-model="form.token_base"
                size="mini"
                :placeholder="$t('common.pleaseChoose')"
              >
                <el-option label="主链币" value="ZLB" />
                <el-option label="ETH" value="ETH" />
                <el-option label="TRX" value="TRX" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否可用" :label-width="formLabelWidth">
              <el-radio v-model="form.enable" label="0">不可用</el-radio>
              <el-radio v-model="form.enable" label="1">可用</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          size="mini"
          @click="dialogFormVisible = false"
        >{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="handleEditTure"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="自动锁仓配置"
      :visible.sync="dialogFormVisibleLock"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formLock"
        :model="formLock"
        :rules="rules3"
        label-width="120px"
        inline
      >
        <el-form-item label="净充值锁仓开关" prop="lockPosition">
          <el-select v-model="formLock.lockPosition" style="width: 93%">
            <el-option label="关" value="0" />
            <el-option label="开" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="锁仓豁免额" prop="exemptAmount">
          <el-input
            v-model="formLock.exemptAmount"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="disabledLock"
          @click="handleEditLock"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <input v-show="false" id="imgInput" type="file" @change="imgChange">
  </div>
</template>

<script>
import {
  listSupportToken,
  addSupportToken,
  updateSupportToken,
  getPWConfig,
  updatePWConfig,
  updateLockConfig
} from '@/api/coin'

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
      } else {
        callback()
      }
    }
    return {
      disabledPW: true,
      dialogFormVisible: false,
      dialogFormVisibleLock: false,
      disabledLock: false,
      radio: '1',
      form: {
        id: undefined,
        file: undefined,
        currency: undefined,
        contact_address: undefined,
        paltform: undefined,
        withdrawal_fee: undefined,
        deposit_confirm: undefined,
        mining_deposit_confirm: undefined,
        address_len: undefined,
        regular: undefined,
        sort: undefined,
        enable: '1',
        is_support_ctc: '1',
        is_support_cfd: '1',
        deposit_open: '1',
        withdraw_open: '1',
        is_support_wallet: '1',
        is_support_option: '1',
        is_virtual_coin: '1',
        release_status: '1',
        token_base: 'ZLB'
      },
      formPW: {
        id: undefined,
        coinSymbol: undefined,
        contractPrecision: undefined,
        withdrawMin: undefined,
        withdrawMaxDayNoAuth: undefined,
        withdrawMinVip: undefined,
        showPrecision: undefined,
        withdrawMax: undefined,
        withdrawMaxDay: undefined,
        withdrawMaxVip: undefined,
        chainAddress: undefined,
        chainTx: undefined,
        depositMin: undefined,
        withdrawMaxDayVip: undefined
      },
      dialogWPForm: false,
      formLock: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      loading: true,
      pageShow: true,
      realName: '',
      tableData: [],
      formLabelWidth: '150px',
      rules: {
        contractPrecision: [
          {
            required: true,
            message: '合约精度不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        withdrawMin: [
          {
            required: true,
            message: '单次提现最小值不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        withdrawMaxDayNoAuth: [
          {
            required: true,
            message: '单日提现最大值(初)不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        withdrawMinVip: [
          {
            required: true,
            message: 'vip单次提现最小值不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        showPrecision: [
          {
            required: true,
            message: '显示精度不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        withdrawMax: [
          {
            required: true,
            message: '单次提现最大值不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        withdrawMaxDay: [
          {
            required: true,
            message: '单日提现最大值(高)',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        withdrawMaxVip: [
          {
            required: true,
            message: '单日提现最大值(高)不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        depositMin: [
          {
            required: true,
            message: '单次充值最小值不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        withdrawMaxDayVip: [
          {
            required: true,
            message: 'vip单日提现最大值不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ]
      },
      rules2: {
        withdrawal_fee: [{ validator: checkQuota, trigger: 'blur' }],
        sort: [{ type: 'number', message: '排序为必须数字', trigger: 'blur' }]
      },
      rules3: {
        lockPosition: [
          {
            required: true,
            message: '请选择锁仓开关',
            trigger: 'blur'
          }
        ],
        exemptAmount: [
          {
            required: true,
            message: '锁仓豁免额不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },

  watch: {},
  created() {
    this.load()
  },
  methods: {
    addImg() {
      document.getElementById('imgInput').click()
    },
    imgChange() {
      this.form.file = document.getElementById('imgInput').files[0].name
      console.log(this.form.file)
    },
    add() {
      this.radio = 1
      document.getElementById('imgInput').value = ''
      this.dialogFormVisible = true
      this.form = {
        file: undefined,
        currency: undefined,
        contact_address: undefined,
        paltform: undefined,
        withdrawal_fee: undefined,
        deposit_confirm: undefined,
        mining_deposit_confirm: undefined,
        address_len: undefined,
        regular: undefined,
        sort: undefined,
        enable: '0',
        is_support_ctc: '0',
        is_support_cfd: '0',
        deposit_open: '0',
        withdraw_open: '0',
        is_support_wallet: '0',
        is_support_option: '0',
        is_virtual_coin: '0',
        release_status: '1',
        token_base: 'ZLB'
      }
    },
    handleEditTure() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          for (const key in this.form) {
            if (!this.form[key] || this.form[key] == '') {
              this.$message({
                showClose: true,
                message: '请填写全部信息',
                type: 'error'
              })
              return
            }
          }
          if (this.radio == 1) {
            this.form = {
              file: document.getElementById('imgInput').files[0],
              currency: this.form.currency,
              contact_address: this.form.contact_address,
              paltform: this.form.paltform,
              withdrawal_fee: this.form.withdrawal_fee,
              deposit_confirm: this.form.deposit_confirm,
              mining_deposit_confirm: this.form.mining_deposit_confirm,
              address_len: this.form.address_len,
              regular: this.form.regular,
              sort: this.form.sort,
              enable: this.form.enable,
              is_support_ctc: this.form.is_support_ctc,
              is_support_cfd: this.form.is_support_cfd,
              deposit_open: this.form.deposit_open,
              withdraw_open: this.form.withdraw_open,
              is_support_wallet: this.form.is_support_wallet,
              is_support_option: this.form.is_support_option,
              is_virtual_coin: this.form.is_virtual_coin,
              release_status: this.form.release_status,
              token_base: this.form.token_base
            }
            if (this.form.token_base == 'ZLB') {
              this.form.token_base = this.form.currency
            }
            addSupportToken(this.form)
              .then((response) => {
                this.$message({
                  showClose: true,
                  message: '添加成功',
                  type: 'success'
                })
                this.dialogFormVisible = false
                this.load()
              })
              .catch((error) => {
                console.log(error)
              })
          } else {
            if (document.getElementById('imgInput').files[0]) {
              this.form.file = document.getElementById('imgInput').files[0]
            } else {
              this.form.file = ''
            }
            if (this.form.token_base == 'ZLB') {
              this.form.token_base = this.form.currency
            }
            updateSupportToken(this.form)
              .then((response) => {
                this.$message({
                  showClose: true,
                  message: '修改成功',
                  type: 'success'
                })
                this.dialogFormVisible = false
                this.load()
              })
              .catch((error) => {
                console.log(error)
              })
          }
        }
      })
    },
    handleEdit(row, index) {
      document.getElementById('imgInput').value = ''
      for (const item in index) {
        if (item != 'sort') {
          this.form[item] = index[item] + ''
        } else {
          this.form[item] = index[item]
        }
      }
      this.form['file'] = index['coin_icon']
      this.radio = 2
      this.dialogFormVisible = true
    },
    // 加载
    load() {
      this.loading = true
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      listSupportToken(formData)
        .then((response) => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 表单重置
    reset() {
      this.formPW = {
        id: undefined,
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        remark: undefined,
        postIds: [],
        roleIds: []
      }
      this.formLock = {
        id: undefined,
        lockPosition: undefined,
        exemptAmount: undefined
      }
      this.resetForm('form')
      this.resetForm('formLock')
    },
    handleWP(index, row) {
      this.reset()
      if (index == 1) {
        this.disabledPW = true
        this.dialogWPForm = true
        this.formPW.coinSymbol = row.currency
      } else if (index == 2) {
        this.dialogFormVisibleLock = false
      }
      const coinSymbol = row.currency
      getPWConfig(coinSymbol).then((response) => {
        if (response.code == 200) {
          if (response.data) {
            for (const item in response.data) {
              response.data[item] = response.data[item] + ''
            }
            if (index == 1) {
              this.disabledPW = false
              this.formPW = response.data
            } else if (index == 2) {
              this.formLock = response.data
              this.dialogFormVisibleLock = true
              this.disabledLock = false
            }
          }
        } else {
          this.msgError('查询失败')
          this.dialogWPForm = false
        }
      })
    },
    handleEditLock() {
      this.$refs['formLock'].validate((valid) => {
        if (valid) {
          this.disabledLock = true
          const data = {
            id: this.formLock.id,
            lockPosition: this.formLock.lockPosition,
            exemptAmount: this.formLock.exemptAmount
          }
          updateLockConfig(data)
            .then((res) => {
              if (res.code == 200) {
                this.msgSuccess('修改成功')
                this.dialogFormVisibleLock = false
                this.load()
              } else {
                this.msgError(res.msg)
              }
              this.disabledLock = false
            })
            .catch((e) => {
              this.disabledLock = false
            })
        }
      })
    },
    cancel() {
      this.dialogFormVisibleLock = false
      this.reset()
      this.load()
    },
    handlePWConfigTure() {
      this.$refs['formPW'].validate((valid) => {
        if (valid) {
          updatePWConfig(this.formPW).then((response) => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.dialogWPForm = false
              this.load()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    }
  }
}
</script>
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
