<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item
        label="UID/手机号/邮箱:"
        prop="userId"
      >
        <el-input
          v-model="queryParams.queryKey"
          placeholder="UID/手机号/邮箱"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item
        label="商户状态:"
        prop="authStatus"
      >
        <el-select
          v-model="queryParams.volumeState"
          size="mini"
          clearable
          :placeholder="$t('common.all')"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商户添加时间:">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查找</el-button>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        label="UID"
        align="center"
        prop="uid"
      />
      <el-table-column
        label="邮箱"
        align="center"
        prop="email"
      />
      <el-table-column
        label="手机号"
        align="center"
        prop="phone"
      />
      <el-table-column
        label="姓名"
        align="center"
        prop="name"
      />
      <el-table-column
        label="昵称"
        align="center"
        prop="nickName"
      />
      <el-table-column
        label="累计发布广告"
        align="center"
        prop="advertBuyCount"
        width="150"
      >
        <template slot-scope="scope">
          <span>买：{{ scope.row.advertBuyCount }}条 卖：{{ scope.row.advertSellCount }}条</span>
        </template>
      </el-table-column>
      <el-table-column
        label="当前在线广告"
        align="center"
        prop="currentBuyAdvert"
        width="150"
      >
        <template slot-scope="scope">
          <span>买：{{ scope.row.currentBuyAdvert }}条 卖：{{ scope.row.currentSellAdvert }}条</span>
        </template>
      </el-table-column>
      <el-table-column
        label="正在进行的订单"
        align="center"
        prop="currentBuyOrderCount"
        width="150"
      >
        <template slot-scope="scope">
          <span>买：{{ scope.row.currentBuyOrderCount }}条 卖：{{ scope.row.currentSellOrderCount }}条</span>
        </template>
      </el-table-column>
      <el-table-column
        label="成单数"
        align="center"
        prop="orderCount"
      />
      <el-table-column
        label="信用度"
        align="center"
        prop="creditValue"
      />
      <el-table-column
        label="申诉失败次数"
        align="center"
        prop="appealFailCount"
      />
      <el-table-column
        label="商户保证金(U)"
        align="center"
        prop="premiumMoney"
      />
      <el-table-column
        label="商户状态"
        align="center"
        prop="volumeState"
      >
        <template slot-scope="scope">
          <div
            v-for="(item, index, key) in statusOptions"
            :key="key"
          >
            <span v-if="scope.row.volumeState == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="商户添加时间"
        align="center"
        prop="ctime"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="500"
        class-name
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.volumeState == 1 || scope.row.volumeState == 2"
            size="mini"
            type="warning"
            @click="handleAdj(scope.$index, scope.row)"
          >调整保证金
          </el-button>
          <el-button
            v-if="scope.row.volumeState == 1"
            size="mini"
            type="danger"
            @click="handleAd(scope.row, 1)"
          >
            冻结广告权限
          </el-button>
          <el-button
            v-else-if="scope.row.volumeState == 2"
            size="mini"
            type="success"
            @click="handleAd(scope.row, 2)"
          >
            恢复广告权限
          </el-button>
          <el-button
            v-if="scope.row.volumeState == 1 || scope.row.volumeState == 2"
            size="mini"
            type="danger"
            @click="handleRelieve(scope.row)"
          >解除商户身份
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="700px"
    >
      <el-form
        ref="dialogForm"
        :model="dialogForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item
          :label="$t('dwmanager.userUID')"
          prop="uid"
        >
          <el-col :span="18">
            <el-input
              v-model="dialogForm.uid"
              placeholder="请输入用户UID"
              :disabled="operation == 2 ? true : false"
            />
          </el-col>
          <el-col :span="4">
            <el-button
              type="primary"
              :disabled="operation == 2 ? true : false"
              @click="queryUser"
            >查询用户
            </el-button>
          </el-col>
        </el-form-item>
        <el-form-item v-if="isShowAuthInfo">
          <el-row>
            <el-col :span="12">
              <template v-if="authInfo.isEmailAuth">
                <i
                  class="el-icon-success"
                  style="font-size: 16px; color: #67C23A;"
                />
                邮箱：{{ authInfo.email }}
              </template>
              <template v-else>
                <i
                  class="el-icon-error"
                  style="font-size: 16px; color: #F56C6C;"
                />
                邮箱：--
              </template>
            </el-col>
            <el-col :span="10">
              <template v-if="authInfo.isPhoneAuth">
                <i
                  class="el-icon-success"
                  style="font-size: 16px; color: #67C23A;"
                />
                手机：{{ authInfo.phone }}
              </template>
              <template v-else>
                <i
                  class="el-icon-error"
                  style="font-size: 16px; color: #F56C6C;"
                />
                手机：--
              </template>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <template v-if="authInfo.isGoogleAuth">
                <i
                  class="el-icon-success"
                  style="font-size: 16px; color: #67C23A;"
                />
                谷歌验证码
              </template>
              <template v-else>
                <i
                  class="el-icon-error"
                  style="font-size: 16px; color: #F56C6C;"
                />
                谷歌验证码：--
              </template>
            </el-col>
            <el-col :span="10">
              <template v-if="authInfo.isHighAuth">
                <i
                  class="el-icon-success"
                  style="font-size: 16px; color: #67C23A;"
                />
                高级认证：{{ authInfo.name }}
              </template>
              <template v-else>
                <i
                  class="el-icon-error"
                  style="font-size: 16px; color: #F56C6C;"
                />
                高级认证：--
              </template>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="划转商户保证金:"
          prop="premiumMoney"
        >
          <el-col :span="12">
            <el-col :span="18">
              <el-input
                v-model="dialogForm.premiumMoney"
                placeholder="请输入大于0的数字"
                :disabled="operation == 2 && (dialogForm.volumeState == 1 || dialogForm.volumeState == 2) ? true : false"
              />
            </el-col>
            <el-col :span="4">
              USDT
            </el-col>
          </el-col>
          <el-col :span="10">
            现货可用余额 {{ balance }} U
          </el-col>
        </el-form-item>
        <el-form-item
          label="昵称:"
          prop="nickName"
        >
          <el-col :span="15">
            <el-input
              v-model="dialogForm.nickName"
              placeholder="请输入4-16位以内字符"
            />
          </el-col>
          <el-col :span="7">
            16位以内字符
          </el-col>
        </el-form-item>
        <el-form-item
          label=""
          prop=""
        >
          手续费率:买广告:0 卖广告:0
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!-- 调整保证金对话框 -->
    <el-dialog
      title="修改商户保证金"
      :visible.sync="add"
      class="modify"
      width="30%"
    >
      <el-form
        ref="adForm"
        :model="adForm"
        :rules="adjRules"
      >
        <el-form-item>
          <el-row>
            <el-col :span="15">
              当前商户保证金：
            </el-col>
            <el-col :span="7">
              {{ adForm.premiumMoney }} U
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-row>
            <el-col :span="15">
              现货可用余额：
            </el-col>
            <el-col :span="7">
              {{ balance }} U
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label=""
          prop="amount"
        >
          <el-row :gutter="10">
            <el-col :span="5">
              <el-select
                v-model="adForm.transferType"
                :placeholder="$t('common.pleaseChoose')"
                @change="changeTransferType"
              >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-col>
            <el-col :span="13">
              <el-input
                v-model="adForm.amount"
                placeholder=""
              />
            </el-col>
            <el-col :span="3">
              USDT
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-model="FinalAmount">
          <el-row>
            <el-col :span="15">
              调整后商户保证金：
            </el-col>
            <el-col :span="5">
              {{ FinalAmount }} U
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div style="text-align: center;">
        <span
          slot="footer"
          class="dialog-footer"
          center:true
        >
          <el-button @click="add = false">{{$t('common.cancel')}}</el-button>
          <el-button
            type="primary"
            @click="handleResult"
          >保 存</el-button>
        </span>
      </div>
    </el-dialog>
    <!-- 冻结恢复广告权限对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="adVisible"
      width="30%"
    >
      <span>{{ adText }}</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="adVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleState"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
    <!-- 解除商户身份 -->
    <el-dialog
      title="确定解除商户身份？"
      :visible.sync="RemoveIdentity"
      width="30%"
    >
      <span>{{ reText }}</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="RemoveIdentity = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleState"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { adjustMerchant, merchantList, addMerchant, editMerchant, handleMerchantState, getAuthInfo, getBalance } from '@/api/otcMerchant'
export default {
  name: 'Merchant',
  data() {
    const checkUid = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入用户UID'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error('请输入正确的UID'))
        } else {
          return callback()
        }
      }
    }
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入大于0的数字'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value) || value <= 0) {
          return callback(new Error('请输入正确数字'))
        } else if (parseFloat(value, 10) > parseFloat(this.balance, 10)) {
          return callback(new Error('商户保证金不能大于现货账户可用余额'))
        } else {
          callback()
        }
      }
    }
    var checkAmount = (rule, value, callback) => {
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (this.adForm.transferType == 1) {
        this.FinalAmount = parseFloat(this.adForm.premiumMoney) + parseFloat(this.adForm.amount)
        if (!reg.test(value) || value <= 0) {
          this.FinalAmount = this.adForm.premiumMoney
          return callback(new Error('请输入正确数字'))
        } else if (parseFloat(this.adForm.amount) > parseFloat(this.balance)) {
          this.FinalAmount = this.adForm.premiumMoney
          return callback(new Error('增加的商户保证金不能大于现货账户可用余额'))
        } else {
          callback()
        }
      }
      if (this.adForm.transferType == 2) {
        this.FinalAmount = parseFloat(this.adForm.premiumMoney) - parseFloat(this.adForm.amount)
        if (!reg.test(value) || value <= 0) {
          this.FinalAmount = this.adForm.premiumMoney
          return callback(new Error('请输入正确数字'))
        } else if ((parseFloat(this.adForm.amount) >= parseFloat(this.adForm.premiumMoney)) || this.FinalAmount < 1) {
          this.FinalAmount = this.adForm.premiumMoney
          return callback(new Error('减少后的商户保证金最低为 1 USDT'))
        } else {
          callback()
        }
      }
    }
    var checkNickname = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入4-16位以内字符'))
      }
      var reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/
      if (value) {
        if (!reg.test(value) || value.length < 4 || value.length > 16) {
          return callback(new Error('请输入正确的昵称'))
        } else {
          callback()
        }
      }
    }
    return {
      options: [
        { label: '增加', value: 1 },
        { label: '减少', value: 2 }
      ],
      add: false,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 商户列表
      dataList: [],
      time: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startTime: undefined,
        endTime: undefined,
        queryKey: undefined,
        volumeState: undefined
      },
      // 是否显示弹出层
      open: false,
      dialogTitle: '',
      // 添加、修改弹窗表单参数
      dialogForm: {
        // id: undefined,
        // uid: undefined,
        // premiumMoney: '',
        // nickName: '',
        // volumeState: ''
      },
      adForm: {},
      adVisible: false,
      RemoveIdentity: false,
      reText: '',
      adText: '',
      operation: 1, // 1：添加， 2：修改
      isShowAuthInfo: false,
      authInfo: {},
      balance: '--',
      statusOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '正常'
        },
        {
          value: '2',
          label: '广告权限冻结中'
        },
        {
          value: '3',
          label: '已解除商户身份'
        }
      ],
      // 冻结、恢复弹窗参数
      stateForm: {},
      // 表单校验
      rules: {
        uid: [
          { required: true, validator: checkUid, trigger: 'blur' }
        ],
        premiumMoney: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        nickName: [
          { required: true, validator: checkNickname, trigger: 'blur' }
        ]
      },
      adjRules: {
        amount: [
          { required: true, validator: checkAmount, trigger: 'blur' }
        ]
      },
      value: '',
      FinalAmount: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 商户列表 */
    getList() {
      merchantList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
      // let response = {
      //   "total": 2,
      //   "rows": [
      //     {
      //       "id": 2,
      //       "uid": 11,
      //       "nickName": "22",
      //       "premiumMoney": "11.0000000000000000",
      //       "volumeState": 1,
      //       "createTime": null,
      //       "updateTime": "2022-02-22T14:32:53.000+08:00",
      //       "phone": null,
      //       "email": null,
      //       "queryKey": null,
      //       "startTime": null,
      //       "endTime": null,
      //       "creditValue": "0",
      //       "orderCount": 0,
      //       "appealFailCount": 0,
      //       "orderTotalCount": 0
      //     }
      //   ],
      //   "summaryRows": null,
      //   "code": 200,
      //   "msg": 0,
      //   "data": null
      // };
      // this.dataList = response.rows;
      // this.total = response.total;
      // this.loading = false;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      if (this.time && this.time[0]) {
        this.queryParams.startTime = this.time[0]
        // this.queryParams.startTime = new Date(this.time && this.time[0]).getTime()
      } else {
        this.queryParams.startTime = undefined
      }
      if (this.time && this.time[1]) {
        this.queryParams.endTime = this.time[1]
        // this.queryParams.endTime = new Date(this.time && this.time[1]).getTime()
      } else {
        this.queryParams.endTime = undefined
      }
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.operation = 1
      this.dialogTitle = '添加场外商户'
      this.open = true
    },
    // 解除商户身份按钮
    handleRelieve(row) {
      const amount = row.premiumMoney
      this.reText = `系统将自动退回${amount} USDT商户保证金`
      this.stateForm.id = row.id
      this.stateForm.volumeState = 3
      this.stateForm.currencyId = process.env.NODE_ENV == 'production' ? 30 : 1
      this.RemoveIdentity = true
    },
    // 调整保证金
    handleAdj(index, row) {
      this.reset()
      this.adForm.premiumMoney = row.premiumMoney
      this.dialogForm.uid = row.uid
      // this.dialogForm.id = row.id;
      this.adForm.uid = row.uid
      this.adForm.id = row.id
      this.adForm.currencyId = process.env.NODE_ENV == 'production' ? 30 : 1
      this.operation = 2
      this.adForm.transferType = 1
      this.FinalAmount = this.adForm.premiumMoney
      this.add = true
      this.queryUser()
    },
    changeTransferType() {
      this.$forceUpdate()
    },
    handleEdit(index, row) {
      this.reset()
      this.operation = 2
      this.dialogForm.id = row.id
      this.dialogForm.uid = row.uid
      this.dialogForm.premiumMoney = row.premiumMoney
      // let tempName = JSON.stringify(row.nickName)
      this.dialogForm.nickName = row.nickName
      this.dialogForm.volumeState = row.volumeState
      this.dialogTitle = '修改场外商户'
      this.dialogForm = Object.assign({}, this.dialogForm)
      this.open = true
      this.queryUser()
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.dialogForm = {
      }
      this.adForm = {}
      this.isShowAuthInfo = false
      this.authInfo = {}
      this.balance = '--'
      this.resetForm('dialogForm')
      this.resetForm('adForm')
    },
    queryUser() {
      const param = {
        uid: this.dialogForm.uid
      }
      if (this.operation == 1) {
        this.$refs.dialogForm.validateField('uid')
      }
      if (!this.dialogForm.uid) {
        return
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[0-9]{0,}$/
      if (!reg.test(this.dialogForm.uid)) {
        return
      }
      getAuthInfo(param).then(response => {
        if (response.code === 200) {
          this.authInfo = response.data
          this.isShowAuthInfo = true
        } else {
          // this.dialogForm.uid = ''
          this.msgError(response.msg)
        }
      }).catch((error) => {
        // this.dialogForm.uid = ''
      })
      const params = {
        currencyId: process.env.NODE_ENV == 'production' ? 30 : 1, // 1代表: usdt
        userId: this.dialogForm.uid
      }
      getBalance(params).then(response => {
        if (response.code === 200) {
          this.balance = response.data.spotAvailableBalance
          // this.balance = 1000
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['dialogForm'].validate(valid => {
        if (valid) {
          this.dialogForm.currencyId = process.env.NODE_ENV == 'production' ? 30 : 1
          if (this.operation == 2) {
            editMerchant(this.dialogForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            this.dialogForm.volumeState = 1
            addMerchant(this.dialogForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess('添加成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    handleAd(data, type) {
      if (type == 1) {
        this.adText = '确认冻结该商户的广告权限？'
      } else {
        this.adText = '确认恢复该商户的广告权限？'
      }
      this.stateForm.id = data.id
      this.stateForm.volumeState = data.volumeState == 1 ? 2 : 1
      this.stateForm.currencyId = process.env.NODE_ENV == 'production' ? 30 : 1
      this.adVisible = true
    },
    handleState() {
      handleMerchantState(this.stateForm).then(response => {
        if (response.code === 200) {
          this.msgSuccess('修改成功')
          this.adVisible = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
      this.RemoveIdentity = false
    },
    handleResult() {
      const params = {
        businessId: this.adForm.id,
        transferType: this.adForm.transferType,
        amount: this.adForm.amount,
        currencyId: this.adForm.currencyId
      }
      adjustMerchant(params).then(response => {
        if (response.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.add = false
          this.getList()
        } else {
          this.msgError(response.msg)
          // this.msgError("操作失败",response.msg);
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.modify {
 ::v-deep .el-form-item__error {
  left: 110px;
 }
}
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    display: flex;
    flex-direction: column;
    margin:0 !important;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    .el-col {
      margin-right: 10px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
    }
  }
  .el-form-item {
    margin: 0 0 15px;
    .modify{
      font-size: 30px;
      font-weight: bold;
      text-align: center;
      display: block;
    }
  }
  .el-form-item__content {
    line-height: 30px;
  }
}
</style>
