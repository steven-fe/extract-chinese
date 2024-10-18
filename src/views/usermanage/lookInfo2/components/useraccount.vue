<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="tableData" :show-header="false" border>
      <el-table-column align="left">
        <el-table-column prop="colName" width="150px" />
        <el-table-column>
          <template slot-scope="scope">
            <el-link v-if="scope.row.isLink" :underline="false" type="primary" @click="toUserInfo(scope.row)">
              {{ scope.row.colLabel }}
            </el-link>
            <span v-else :style="{color:scope.row.colLabel=='关闭'?'#ec808d':''}">
              {{ scope.row.accountType === 2 ? '' : scope.row.colLabel }}
            </span>
            <div v-if="scope.row.scene === 'accountType'">
              <template v-if="scope.row.accountTypeContent">
                <!--          0:普通账号 1:主账号 2:子账号-->
                <span v-if="scope.row.accountTypeContent.accountType === 0">{{ $t('userManager.normalAccount') }}</span>
                <span v-if="scope.row.accountTypeContent.accountType === 1">
                  {{ $t('userManager.mainAccount') }} | {{ $t('userManager.createSubAccountNum') }}
                  <span :style="{ cursor: 'pointer', color: scope.row.accountTypeContent.createdSubUserCount > 0 ? '#1c84c6' : '' }" @click="toChildrenAccountTab">{{ scope.row.accountTypeContent.createdSubUserCount }}</span>
                  （{{ $t('userManager.upper') }}{{ scope.row.accountTypeContent.createdSubUserMaxCount }}）
                  {{ $t('userManager.subAccpountPermission') }}
                  <span v-if="scope.row.accountTypeContent.createSubAccountStatus === 0" style="color: red">{{ $t('userManager.closed') }}</span>
                  <span v-if="scope.row.accountTypeContent.createSubAccountStatus === 1" style="color: #1c84c6">{{ $t('userManager.opened') }}</span>
                  <el-button plain size="mini" class="btn-primary" @click="changeStatus(scope.row.accountTypeContent.createSubAccountStatus)">
                    {{ scope.row.accountTypeContent.createSubAccountStatus === 0 ? $t('userManager.open') : $t('userManager.close') }}
                  </el-button>
                </span>
                <span v-if="scope.row.accountTypeContent.accountType === 2">
                  {{ $t('userManager.subAccount') }} | {{ $t('userManager.inMainAccountUID') }}
                  <span style="color: #1c84c6;cursor: pointer" @click="updateLookInfo(scope.row.accountTypeContent.parentUserUid, scope.row.accountTypeContent.parentUserId)">{{ scope.row.accountTypeContent.parentUserUid }}</span>
                  <!--                  1:正常、2:冻结、3:正在审核、4:审核未通过、5:已删除-->
                  <span v-if="scope.row.accountTypeContent.status === 1" style="color: green">使用中</span>
                  <span v-if="scope.row.accountTypeContent.status === 2" style="color: red">已冻结</span>
                  <span v-if="scope.row.accountTypeContent.status === 5">已删除</span>
                </span>
              </template>
            </div>
            <el-button v-if="scope.row.scene === 'superInviter'" v-hasPermi="['coinbull:user:unbind']" plain size="mini" class="btn-primary" @click="userUnbind(scope.row)">
              {{ $t('userManager.untie') }}
            </el-button>
            <!--关闭登陆-->
            <template>
              <el-button v-if="scope.row.hasButton && +scope.row.colValue === 1 && scope.row.title" plain size="mini" class="btn-primary" @click="handleWork(scope.row)">
                {{ scope.row.hasButton+scope.row.title }}
              </el-button>
            </template>
            <el-button v-if="scope.row.accountType !== 2 && scope.row.hasButton && +scope.row.colValue === 0 && scope.row.title" plain size="mini" type="success" class="btn-primary" @click="handleWork(scope.row)">
              {{ scope.row.hasButton+scope.row.title }}
            </el-button>
            <el-button v-if="scope.row.hasButton && !scope.row.title" plain size="mini" class="btn-primary" @click="handleWork(scope.row)">
              {{ scope.row.hasButton }}
            </el-button>
            <span v-if="scope.row.scene === 'withdrawStatus'">
              <!--              如果是子账号，没有提币权限-->
              <template v-if="scope.row.accountType === 2">
                <span style="color: red">{{ $t('userManager.closeTip') }}</span>
              </template>
              <template v-else>
                {{ $t('userManager.tip1') }}
              </template>
            </span>
            <span v-if="scope.row.scene === 'depositStatus'">
              <!--              如果是子账号，没有充币权限-->
              <template v-if="scope.row.accountType === 2 && scope.row.depositStatus === 0">
                <span style="color: red">关闭 原因：子账号-无充币权限</span>
              </template>
              <template v-else>
                <span>正常</span>
              </template>
            </span>
            <el-button v-if="scope.row.hasUnbindButton && !scope.row.title" plain size="mini" type="danger" class="btn-primary" @click="handleUnbind(scope.row)">
              {{ scope.row.hasUnbindButton }}
            </el-button>
            <el-button v-if="scope.row.hasBindButton && !scope.row.title" plain size="mini" class="btn-primary" @click="handleBind(scope.row)">
              {{ scope.row.hasBindButton }}
            </el-button>
            <div v-if="scope.row.scene === 'userCategory'">
              <template v-if="scope.row.data.classCode">
                {{ scope.row.data.className }}
                （ID： <el-link type="primary" :underline="false" @click="() => $router.push({ name: 'userCategoryDetail', query: { id: scope.row.data.classId } })">{{ scope.row.data.classCode }}</el-link> ）
                <el-button plain size="mini" @click="openEditUserCategoryModal(scope.row.data)">{{ $t('userManager.changeUserType') }}</el-button>
                <el-button plain size="mini" @click="removeUserCategory({ classId: scope.row.data.classId, uid: scope.row.data.uid })">{{ $t('userManager.deleteUserType') }}</el-button>
              </template>
              <template v-else>--</template>
            </div>
            <div v-if="scope.row.scene === 'userPermission'">
              <div class="rules-content">
                <el-tag v-if="userInfoData && userInfoData.cmsSpotTradeLimit === 0" :disable-transitions="true" size="medium" type="success">
                  {{ $t('userManager.spotTrading') }}
                </el-tag>
                <el-tag v-else-if="userInfoData && userInfoData.cmsSpotTradeLimit === 1" :disable-transitions="true" size="medium" type="danger">
                  <img src="@/assets/image/disabled-icon.png" alt="">
                  {{ $t('userManager.spotTrading') }}
                </el-tag>

                <el-tag v-else-if="userInfoData && userInfoData.cmsSpotTradeLimit === 2" size="medium" type="danger" :disable-transitions="true">
                  <img src="@/assets/image/disabled-icon.png" alt="">
                  {{ $t('userManager.spotOkList') }}
                  <el-tooltip class="item" effect="dark" :content="spotTradePairsList" placement="top" popper-class="permission-tooltip">
                    <i class="el-icon-warning-outline" />
                  </el-tooltip>
                </el-tag>

                <el-tag v-if="userInfoData && userInfoData.cmsSwapTradeLimit === 0" :disable-transitions="true" size="medium" type="success">
                  {{ $t('userManager.pactTrading') }}
                </el-tag>
                <el-tag v-else-if="userInfoData && userInfoData.cmsSwapTradeLimit === 1" :disable-transitions="true" size="medium" type="danger">
                  <img src="@/assets/image/disabled-icon.png" alt="">
                  {{ $t('userManager.pactTrading') }}
                </el-tag>
                <el-button type="text" size="medium" @click="$emit('goToPremission')">{{ $t('userManager.userPermissionManage') }}</el-button>
              </div>
            </div>
            <span v-if="scope.row.scene === 'phone'">
              {{ $t('userManager.userPhone') }}
              <span v-if="scope.row.status === 0 || scope.row.status === 2" class="statusRed">{{ $t('userManager.closed') }}</span>
              <span v-if="scope.row.status === 1" class="statusGreen">{{ $t('userManager.opened') }}</span>
            </span>
            <span v-if="scope.row.scene === 'email'">
              {{ $t('userManager.userEmail') }}
              <span v-if="scope.row.status === 0 || scope.row.status === 2" class="statusRed">{{ $t('userManager.closed') }}</span>
              <span v-if="scope.row.status === 1" class="statusGreen">{{ $t('userManager.opened') }}</span>
            </span>
            <span v-if="scope.row.scene === 'gaAuthStatus'">
              {{ $t('userManager.userGoogle') }}
              <span v-if="scope.row.status === 0 || scope.row.status === 2" class="statusRed">{{ $t('userManager.closed') }}</span>
              <span v-if="scope.row.status === 1" class="statusGreen">{{ $t('userManager.opened') }}</span>
            </span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="95px">
        <el-form-item v-if="changetype==1" :label="$t('userManager.areaNo')" prop="countryCode">
          <el-select v-model="form.countryCode" filterable :placeholder="$t('userManager.areaNoTip')">
            <el-option v-for="(item,index) in countrys" :key="index" :label="item.cnName+item.dialingCode" :value="item.dialingCode" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="changetype==1||changetype==2" :label="oldaccounttitle" prop="oldaccount">
          <el-input v-model="form.oldaccount" disabled />
        </el-form-item>
        <el-form-item v-if="changetype==1||changetype==2" :label="accounttitle" prop="newaccount">
          <el-input v-model="form.newaccount" :placeholder="$t('userManager.inputNewAccount')" />
        </el-form-item>
        <el-form-item v-if="changetype==4" :label="accounttitle" prop="newaccount">
          <el-input v-model="form.newaccount" :placeholder="$t('userManager.inputText')" />
        </el-form-item>
        <el-form-item :label="$t('userManager.operateText')" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="5" :placeholder="$t('userManager.inputOperate')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" :disabled="disabledSubmitForm" @click="submitForm">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 申请绑定手机号 -->
    <el-dialog :title="$t('userManager.bindPhone')" :visible.sync="open1" :close-on-click-modal="false" width="500px" :before-close="cancel1">
      <el-form ref="bindPhone" :model="bindPhone" :rules="rules1" label-width="95px">
        <el-form-item :label="$t('userManager.areaNo')" prop="countryCode">
          <el-select v-model="bindPhone.countryCode" filterable :placeholder="$t('userManager.areaNoTip')">
            <el-option v-for="(item,index) in countrys" :key="index" :label="item.cnName+item.dialingCode" :value="item.dialingCode" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('userManager.newPhone')" prop="phone">
          <el-input v-model="bindPhone.phone" :placeholder="$t('userManager.inputNewAccount')" />
        </el-form-item>
        <el-form-item :label="$t('userManager.operateText')" prop="remark">
          <el-input v-model="bindPhone.remark" type="textarea" :rows="5" :placeholder="$t('userManager.inputOperate')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel1">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleSubmitPhone">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 申请绑定邮箱 -->
    <el-dialog :title="$t('userManager.bindEmail')" :visible.sync="open2" :close-on-click-modal="false" width="500px" :before-close="cancel2">
      <el-form ref="bindEmail" :model="bindEmail" :rules="rules2" label-width="95px">
        <el-form-item :label="$t('userManager.newEmail')" prop="email">
          <el-input v-model="bindEmail.email" :placeholder="$t('userManager.inputNewAccount')" />
        </el-form-item>
        <el-form-item :label="$t('userManager.operateText')" prop="remark">
          <el-input v-model="bindEmail.remark" type="textarea" :rows="5" :placeholder="$t('userManager.inputOperate')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel2">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleSubmitEmail">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  userInfo,
  updateUserStatus,
  updateUserWithdraw,
  userInfoPE,
  getCountryList,
  applyUpdateMobile,
  applyUpdateEmail,
  applyUpdateGA,
  applyUpdateTagName,
  userUnbind,
  bindOrUnBindContactInfo
} from '@/api/user'

import { updateStatus } from '@/api/createChildrenUser'
import { instance as editUserCategory } from '@/views/usermanage/user-category/components/edit-user-category'
import removeUserCategory from '@/views/usermanage/user-category/components/remove-user-category'
import { MessageBox } from 'element-ui'
import { getList } from '@/api/systemsetting/currencypairmanage'
export default {
  props: {
    msg: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    var checkQuota = (rule, value, callback) => {
      if (+this.changetype !== 1) {
        callback()
      } else if (value === undefined) {
        callback(new Error(this.$t('userManager.areaNoTip')))
      } else {
        callback()
      }
    }
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('userManager.inputSccessNumber')))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error(this.$t('userManager.inputSccessNumber')))
        } else {
          callback()
        }
      }
    }
    return {
      emailFlag: '',
      phoneFlag: '',
      queryParams: {
        uid: this.msg
      },
      loading: false,
      disabledSubmitForm: false,
      title: undefined,
      dialogVisible: false,
      form: {},
      countrys: [],
      changetype: undefined,
      accounttitle: undefined,
      oldaccounttitle: undefined,
      tableData: [
        {
          scene: 'userId',
          colName: '用户ID',
          colValue: this.msg,
          isLink: false,
          hasButton: undefined,
          colLabel: this.msg,
          title: undefined
        },
        {
          scene: 'accountType',
          colName: '账号类型',
          colValue: '',
          isLink: false,
          hasButton: undefined,
          colLabel: '',
          title: undefined
        },
        {
          scene: 'UID',
          colName: 'UID',
          colValue: '',
          isLink: false,
          hasButton: undefined,
          colLabel: '',
          title: undefined
        },
        {
          scene: 'userPermission',
          colName: '用户权限',
          colValue: '',
          isLink: false,
          hasButton: undefined,
          colLabel: '',
          title: undefined
        },
        // {
        //   scene: 'accountType',
        //   colName: '账号类型',
        //   colValue: '',
        //   isLink: false,
        //   hasButton: undefined,
        //   colLabel: '',
        //   title: undefined
        // },
        {
          scene: 'phone',
          colName: '手机',
          colValue: undefined,
          isLink: false,
          hasButton: '申请修改手机',
          hasBindButton: '申请绑定手机',
          hasUnbindButton: '申请解绑手机',
          status: '',
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'email',
          colName: '邮箱',
          colValue: undefined,
          isLink: false,
          hasButton: '申请修改邮箱',
          hasBindButton: '申请绑定邮箱',
          hasUnbindButton: '申请解绑邮箱',
          status: '',
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'gaAuthStatus',
          colName: '谷歌验证',
          colValue: undefined,
          isLink: false,
          hasButton: '申请重置谷歌验证',
          status: '',
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'authLevel',
          colName: '认证级别',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'userRealName',
          colName: '姓名',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'countryCode',
          colName: '国家编码',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'countryName',
          colName: '国家名称',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'superInviter',
          colName: '上级邀请人',
          colValue: undefined,
          isLink: true,
          hasButton: '',
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'shareCode',
          colName: '专属邀请码',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'inviteNum',
          colName: '邀请人数',
          colValue: 0,
          isLink: true,
          hasButton: undefined,
          colLabel: '--',
          title: undefined
        },
        // {
        //   scene: "authenticationCode",
        //   colName: "BTFBLP身份码",
        //   colValue: undefined,
        //   isLink: false,
        //   hasButton: undefined,
        //   colLabel: "--",
        //   title: undefined,
        // },
        {
          scene: 'userCategory',
          colName: '用户分类',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: undefined,
          title: undefined,
          data: {}
        },
        {
          scene: 'underwriterFlag',
          colName: '用户身份',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--',
          title: undefined
        },
        {
          scene: 'loginStatus',
          colName: '登录权限',
          colValue: undefined,
          isLink: false,
          hasButton: '关闭',
          colLabel: '--',
          title: '登录'
        },
        {
          scene: 'withdrawStatus',
          colName: '提现权限',
          colValue: undefined,
          isLink: false,
          hasButton: '关闭',
          colLabel: '--',
          title: '提现'
        },
        {
          scene: 'depositStatus',
          colName: '充币权限',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '',
          title: '充币'
        }
        // {
        //   scene: "invitationOpen",
        //   colName: "返佣权限",
        //   colValue: undefined,
        //   isLink: false,
        //   hasButton: "关闭",
        //   colLabel: "--",
        //   title: "返佣",
        // },
        // {
        //   scene: "contractExcStatus",
        //   colName: "合约交易权限",
        //   colValue: undefined,
        //   isLink: false,
        //   hasButton: "关闭",
        //   colLabel: "--",
        //   title: "合约交易",
        // },
        // {
        //   scene: "futuresOpen",
        //   colName: "期权交易权限",
        //   colValue: undefined,
        //   isLink: false,
        //   hasButton: "关闭",
        //   colLabel: "--",
        //   title: "期权交易",
        // },
        // {
        //   scene: "otcExcStatus",
        //   colName: "OTC交易权限",
        //   colValue: undefined,
        //   isLink: false,
        //   hasButton: "关闭",
        //   title: "OTC交易",
        //   colLabel: "--",
        // },
        // {
        //   scene: "tagName",
        //   colName: "备注名",
        //   colValue: undefined,
        //   isLink: false,
        //   hasButton: "修改",
        //   colLabel: "--",
        //   title: "",
        // },
      ],
      open1: false,
      open2: false,
      bindPhone: {
        type: '',
        countryCode: '',
        phone: '',
        remark: ''
      },
      bindEmail: {
        type: '',
        email: '',
        remark: ''
      },
      rules: {
        newaccount: [
          { required: true, message: '该参数不能为空', trigger: 'blur' }
        ],
        countryCode: [{ validator: checkQuota, trigger: 'blur' }]
      },
      rules1: {
        phone: [
          { required: true, message: '该参数不能为空', trigger: 'blur' },
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        countryCode: [{ required: true, validator: checkQuota, trigger: 'blur' }]
      },
      rules2: {
        email: [
          { required: true, message: '该参数不能为空', trigger: 'blur' }
        ]
      },
      accountType: 1,
      createSubAccountPermission: 1,
      userInfoData: null,
      spotList: []
    }
  },
  computed: {
    spotTradePairsList() {
      const list = []
      this.userInfoData && this.userInfoData.cmsSpotTradePairsList.forEach(_i => {
        this.spotList.forEach(_s => {
          if (_i === _s.id) {
            list.push(_s.label)
          }
        })
      })
      return `允许交易：${list.join('、')}`
    }
  },
  async mounted() {
    await this.getSpotList()
    this.getUserInfo()
    this.countryList()
  },
  methods: {
    updateLookInfo(uid, userId) {
      sessionStorage.setItem('uid', uid)
      sessionStorage.setItem('userId', userId)
      this.$emit('updateLookInfo')
    },
    async getSpotList() {
      const { rows } = await getList({
        pageSize: 9999
      })
      // todo: 是否需要判断是否可交易，是否上线等情况
      this.spotList = rows.map(item => {
        return {
          id: item.instrumentId,
          label: item.showName
        }
      })
    },
    changeCreatePermission() {
      const innerText = this.createSubAccountPermission === 1
        ? `确认关闭创建子账号权限`
        : `确认开启创建子账号权限`
      MessageBox.confirm(innerText, this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '操作成功!'
        })
      }).catch(() => {

      })
    },
    // 国家编码
    countryList() {
      getCountryList()
        .then((response) => {
          if (+response.code === 200) {
            this.countrys = response.data
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 获取信息
    getUserInfo() {
      this.loading = true
      userInfo(this.queryParams)
        .then((response) => {
          const accountType = response.data.accountType
          this.$emit('getAccountType', accountType)
          if (+response.code === 200) {
            // loginStatus: 1 contains 1 and 2
            this.userInfoData = response.data
            if (response.data.loginStatus === 2) response.data.loginStatus = 1

            const map = new Map(Object.entries(response.data))
            this.handleData(map)
            this.loading = false
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 取消按钮
    cancel() {
      this.dialogVisible = false
      this.title = undefined
      this.form = {}
      this.changetype = undefined
      this.accounttitle = undefined
      this.oldaccounttitle = undefined
      this.loading = false
      this.disabledSubmitForm = false
    },
    // 构建表格
    handleData(data) {
      this.tableData.forEach((element) => {
        if (element.scene === 'UID') {
          element.colValue = element.colLabel = sessionStorage.getItem('uid')
        } else if (element.scene === 'gaAuthStatus') {
          element.colLabel = +data.get(element.scene) === 0 ? '未绑定' : '已绑定'
          element.hasButton = +data.get(element.scene) === 0 ? undefined : '申请重置谷歌验证'
          element.status = data.get('gaAuthStatus')
        } else if (element.scene === 'authLevel') {
          element.colLabel = +data.get(element.scene) === 0 ? '未认证' : +data.get(element.scene) === 1 ? '初级认证' : '高级认证'
        } else if (element.scene === 'underwriterFlag') {
          element.colLabel = +data.get(element.scene) === 0 ? '普通用户' : '承销商'
        } else if (element.scene === 'superInviter' || element.scene === 'inviteNum') {
          element.isLink = !(+data.get(element.scene) === 0 || +data.get(element.scene) === 0)
          element.colLabel = +data.get(element.scene) === 0 ? element.colLabel : data.get(element.scene)
        } else if (element.scene === 'loginStatus' || element.scene === 'withdrawStatus' || element.scene === 'contractExcStatus' ||
          element.scene === 'otcExcStatus' || element.scene === 'futuresOpen' || element.scene === 'invitationOpen') {
          element.colLabel = +data.get(element.scene) === 0 ? '关闭' : '正常'
          element.hasButton = +data.get(element.scene) === 0 ? '开启' : '关闭'
          element.accountType = data.get('accountType')
        } else if (element.scene === 'depositStatus') {
          element.depositStatus = +data.get('depositStatus')
          element.accountType = +data.get('accountType')
        } else if (element.scene === 'phone') {
          element.hasButton = +data.get(element.scene) === 0 ? undefined : '申请修改手机'
          element.hasBindButton = data.get(element.scene) !== '' ? undefined : '申请绑定手机'
          element.hasUnbindButton = +data.get(element.scene) === 0 ? undefined : '申请解绑手机'
          element.colLabel = +data.get(element.scene) === 0 ? element.colLabel : data.get(element.scene)
          element.status = data.get('phoneAuthStatus')
          this.phoneFlag = +data.get(element.scene) === 0 ? 0 : 1
        } else if (element.scene === 'email') {
          element.hasButton = +data.get(element.scene) === 0 ? undefined : '申请修改邮箱'
          element.hasBindButton = data.get(element.scene) !== '' ? undefined : '申请绑定邮箱'
          element.hasUnbindButton = +data.get(element.scene) === 0 ? undefined : '申请解绑邮箱'
          element.colLabel = +data.get(element.scene) === 0 ? element.colLabel : data.get(element.scene)
          element.status = data.get('emailAuthStatus')
          this.emailFlag = +data.get(element.scene) === 0 ? 0 : 1
        } else if (element.scene === 'userCategory') {
          element.data = {
            userId: data.get('userId'),
            uid: sessionStorage.getItem('uid'),
            classCode: data.get('classCode'),
            classId: data.get('classId'),
            className: data.get('className')
          }
        } else if (element.scene === 'accountType') {
          element.accountTypeContent = {
            status: data.get('status'),
            accountType: data.get('accountType'),
            createdSubUserCount: data.get('createdSubUserCount'),
            createdSubUserMaxCount: data.get('createdSubUserMaxCount'),
            createSubAccountStatus: data.get('createSubAccountStatus'),
            parentUserUid: data.get('parentUserUid'),
            parentUserId: data.get('parentUserId')
          }
          sessionStorage.setItem('createSubAccountStatus', data.get('createSubAccountStatus'))
        } else {
          element.colLabel = +data.get(element.scene) === 0 ? element.colLabel : data.get(element.scene)
        }
        element.colValue = data.get(element.scene)
      })

      this.loading = false
    },
    toChildrenAccountTab(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      this.$emit('toChildrenAccountTab')
    },
    // 按钮点击
    handleWork(obj) {
      if (obj.scene === 'phone' || obj.scene === 'email' || obj.scene === 'gaAuthStatus') {
        // 修改手机、邮箱、谷歌
        this.updateAccent(obj)
      } else if (obj.scene === 'tagName') {
        // 修改备注
        this.updateTagNameDialog(obj)
      } else {
        // 修改权限
        this.handlePermission(obj)
      }
    },
    // 解绑邀请关系
    userUnbind(row) {
      const userinfo = this.tableData.find(ele => ele.scene === 'UID')
      const obj = this.tableData.find(ele => ele.scene === 'userId')
      this.$confirm(`确定要为${userinfo.colLabel}解绑与上级的邀请关系吗？`, '解绑邀请关系', {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          userUnbind({ uid: obj ? obj.colLabel : '' }).then(res => {
            if (res.code === 200) {
              this.$message.success('解绑成功')
            } else {
              this.$message.warning(res.msg)
            }
          })
        })
        .catch(function() { })
    },
    // 修改手机、邮箱、谷歌弹窗
    updateAccent(obj) {
      // this.loading = true;
      this.changetype = undefined
      this.dialogVisible = false
      if (obj.scene === 'phone') {
        this.changetype = 1
        this.title = '申请修改手机号'
        this.accounttitle = '新手机号：'
        this.oldaccounttitle = '原手机号：'
        this.getAccountInfo()
      } else if (obj.scene === 'email') {
        this.changetype = 2
        this.title = '申请修改邮箱'
        this.accounttitle = '新邮箱'
        this.oldaccounttitle = '原邮箱'
        this.getAccountInfo()
      } else {
        this.changetype = 3
        this.title = '申请重置谷歌验证'
        this.dialogVisible = true
      }
    },
    changeStatus(status) {
      const title = `确认${status === 1 ? '关闭' : '开启'}创建子账号权限? `
      const msg = status === 1 ? '关闭后，母账号无法再创建新的子账号，现有子账号不受影响' : '重新开启后，母账号可以创建新的子账号'
      this.$confirm(msg, title, {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        updateStatus({ userId: this.msg, status: status === 1 ? 0 : 1 }).then(res => {
          this.$message({ type: 'success', message: '更新成功' })
          this.getUserInfo()
        })
      }).catch(e => {
        this.$message({ type: 'info', message: '已取消' })
      })
    },
    // 获取手机号、邮箱
    getAccountInfo() {
      const form = {
        type: this.changetype,
        uid: this.msg
      }
      userInfoPE(form)
        .then((response) => {
          if (+response.code === 200) {
            this.form.oldaccount = response.msg
            this.dialogVisible = true
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 修改备注弹窗
    updateTagNameDialog(obj) {
      // this.loading = true;
      this.changetype = 4
      this.title = '修改备注'
      this.accounttitle = '备注名'
      this.dialogVisible = true
    },
    // 修改权限
    handlePermission(obj) {
      let type, changeStatus
      switch (obj.scene) {
        case 'loginStatus': // 登录
          type = 1
          break
        case 'withdrawStatus': // 提现
          type = 2
          break
        case 'invitationOpen': // 返佣
          type = 6
          break
        case 'futuresOpen': // 期权
          type = 7
          break
        case 'contractExcStatus': // 合约
          type = 5
          break
        case 'otcExcStatus': // OTC
          type = 4
          break
      }
      switch (obj.colValue) {
        case 1: // 关闭
          changeStatus = 0
          break
        case 0: // 开启
          changeStatus = 1
          break
      }
      if (type === undefined || changeStatus === undefined) {
        this.msgError('系统异常')
        return
      }
      const userId = this.msg
      this.loading = true
      this.$prompt('请输入原因', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel')
      })
        .then(({ value }) => {
          const formData = {
            type: type,
            userId: userId,
            status: changeStatus,
            reason: value
          }
          ;(type === 2 ? updateUserWithdraw : updateUserStatus)(formData)
            .then((response) => {
              this.getUserInfo()
              this.$message({
                showClose: true,
                message: this.$t('common.operationSucceed'),
                type: 'success'
              })
            })
            .catch((error) => {
              console.log(error)
            }).then(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.loading = false
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
    },
    // 点击提交
    submitForm() {
      switch (this.changetype) {
        case 1:
          this.updateMobile()
          break
        case 2:
          this.updateEmail()
          break
        case 3:
          this.updateGA()
          break
        case 4:
          this.updateTagName()
          break
        default:
          break
      }
    },
    updateMobile() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.disabledSubmitForm = true
          const data = {
            userId: this.msg,
            itemType: 1,
            countryCode: this.form.countryCode,
            oldItem: this.form.oldaccount,
            newItem: this.form.newaccount,
            applyRemark: this.form.reason
          }
          applyUpdateMobile(data)
            .then((response) => {
              if (+response.code === 200) {
                this.msgSuccess('申请成功！')
              } else {
                this.msgError(response.msg)
              }
              this.cancel()
            })
            .catch((error) => {
              this.disabledSubmitForm = false
              console.log(error)
            })
        }
      })
    },
    updateEmail() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.disabledSubmitForm = true
          const data = {
            userId: this.msg,
            itemType: 2,
            oldItem: this.form.oldaccount,
            newItem: this.form.newaccount,
            applyRemark: this.form.reason
          }
          applyUpdateEmail(data)
            .then((response) => {
              if (+response.code === 200) {
                this.msgSuccess('申请成功！')
              } else {
                this.msgError(response.msg)
              }
              this.cancel()
            })
            .catch((error) => {
              this.disabledSubmitForm = false
              console.log(error)
            })
        }
      })
    },
    updateGA() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.disabledSubmitForm = true
          const data = {
            userId: this.msg,
            itemType: 3,
            applyRemark: this.form.reason
          }
          applyUpdateGA(data)
            .then((response) => {
              if (+response.code === 200) {
                this.msgSuccess('申请成功！')
              } else {
                this.msgError(response.msg)
              }
              this.cancel()
            })
            .catch((error) => {
              this.disabledSubmitForm = false
              console.log(error)
            })
        }
      })
    },
    updateTagName() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.disabledSubmitForm = true
          const data = {
            userId: this.msg,
            tagName: this.form.newaccount,
            remark: this.form.reason
          }
          applyUpdateTagName(data)
            .then((response) => {
              if (+response.code === 200) {
                this.msgSuccess('修改成功！')
                this.getUserInfo()
              } else {
                this.msgError(response.msg)
              }
              this.cancel()
            })
            .catch((error) => {
              this.disabledSubmitForm = false
              console.log(error)
            })
        }
      })
    },

    toUserInfo(row) {
      if (row.scene === 'inviteNum') {
        // 跳邀请列表
        sessionStorage.setItem('uid', sessionStorage.getItem('uid'))
        this.$router.push({ name: 'userinvitationlist' })
      } else {
        // 跳用户详情
        sessionStorage.setItem('uid', row.colValue)
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect/lookInfo2/index'
          })
        })
      }
    },
    cancel1() {
      this.open1 = false
      this.$refs['bindPhone'].resetFields()
    },
    cancel2() {
      this.open2 = false
      this.$refs['bindEmail'].resetFields()
    },
    handleUnbind(row) {
      if (row.scene === 'phone') {
        if (+this.emailFlag === 1) {
          const params = {
            userId: this.msg,
            type: 1
          }
          bindOrUnBindContactInfo(params).then(response => {
            if (response.code === 200) {
              this.msgSuccess('提交审核成功')
              this.getUserInfo()
            } else {
              this.msgError(response.msg)
            }
          })
        } else {
          this.msgError('必须同时绑定手机号和邮箱,才能进行此操作')
        }
      }
      if (row.scene === 'email') {
        if (+this.phoneFlag === 1) {
          const params = {
            userId: this.msg,
            type: 3
          }
          bindOrUnBindContactInfo(params).then(response => {
            if (response.code === 200) {
              this.msgSuccess('提交审核成功')
              this.getUserInfo()
            } else {
              this.msgError(response.msg)
            }
          })
        } else {
          this.msgError('必须同时绑定手机号和邮箱,才能进行此操作')
        }
      }
    },
    handleBind(row) {
      if (row.scene === 'phone') {
        this.open1 = true
      } else if (row.scene === 'email') {
        this.open2 = true
      }
    },
    handleSubmitPhone() {
      this.$refs['bindPhone'].validate(valid => {
        if (valid) {
          const params = {
            userId: this.msg,
            type: 0,
            countryCode: this.bindPhone.countryCode,
            phone: this.bindPhone.phone,
            remark: this.bindPhone.remark
          }
          bindOrUnBindContactInfo(params).then(response => {
            if (response.code === 200) {
              this.msgSuccess('提交审核成功')
              this.cancel1()
              this.getUserInfo()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    handleSubmitEmail() {
      this.$refs['bindEmail'].validate(valid => {
        if (valid) {
          const params = {
            userId: this.msg,
            type: 2,
            email: this.bindEmail.email,
            remark: this.bindEmail.remark
          }
          bindOrUnBindContactInfo(params).then(response => {
            if (response.code === 200) {
              this.cancel2()
              this.msgSuccess('提交审核成功')
              this.getUserInfo()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    openEditUserCategoryModal(row) {
      editUserCategory.open(row, this.getUserInfo)
    },
    removeUserCategory(row) {
      removeUserCategory(row, this.getUserInfo)
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.btn-primary {
  margin-left: 10px;
}
.statusRed {
  color: red;
}
.statusGreen {
  color: dodgerblue;
}
.rules-content {
  display: flex;
  align-items: center;
  .el-tag {
    display: flex;
    align-items: center;
    margin-right: 15px;
    i {
      font-size: 14px;
      margin-left: 4px;
      margin-top: 2px;
    }
    img {
      width: 12px;
      margin-right: 4px;
    }
  }
}
.accountType-wraper {
  display: flex;
  align-items: center;
  .account-type {
    .type-wraper {
      display: flex;
      align-items: center;
      span {
        color: #409EFF;
        padding: 0 4px;
      }
    }
  }
  .handle-wraper {
    display: flex;
    align-items: center;
    .el-button {
      margin-left: 10px;
    }
    .opened {
      color: #F56C6C;
    }
  }
}
</style>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" module>
.permission-tooltip {
  max-width: 500px;
  word-break: break-all;
}
</style>
