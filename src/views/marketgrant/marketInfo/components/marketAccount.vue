<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="tableData" :show-header="false" border>
      <el-table-column align="left">
        <el-table-column prop="colName" width="150px" />
        <el-table-column>
          <template slot-scope="scope">
            <el-link
              v-if="scope.row.isLink"
              :underline="false"
              type="primary"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.colLabel }}</el-link>
            <span v-else>{{ scope.row.colLabel }} </span>
            <el-button
              v-if="scope.row.hasButton"
              plain
              size="mini"
              class="btn-primary"
              @click="handleWork()"
            >修改</el-button>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

    <h4>资产数据统计</h4>
    <el-table v-loading="loading2" :data="capitalData" border>
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column
        label="资产总额"
        align="center"
        prop="marketAccBalance"
      />
      <el-table-column label="冻结中资产" align="center" prop="frozenAmt" />
      <el-table-column label="可提现金额" align="center" prop="avlAmt" />
      <el-table-column
        label="累计做市收益"
        align="center"
        prop="marketProfitAmt"
      />
      <el-table-column label="累计充值" align="center" prop="chargeAmt" />
      <el-table-column label="累计提现" align="center" prop="withdrawAmt" />
      <el-table-column label="贡献交易金额" align="center" prop="txnAmt" />
      <el-table-column label="贡献手续费" align="center" prop="txnFee" />
      <el-table-column
        label="为平台创造收益"
        align="center"
        prop="platformProfitAmt"
      />
    </el-table>
    <!-- 修改做市商信息对话框 -->
    <el-dialog
      title="修改做市信息"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="800px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" disabled />
        </el-form-item>
        <el-form-item label="做市商等级" prop="levelId">
          <el-select
            v-model="form.levelId"
            style="width: 100%"
            placeholder="请选择做市商等级"
          >
            <el-option
              v-for="(item, index) in levelIdOptions"
              :key="index"
              :label="item.levelName + '做市商'"
              :value="item.levelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="做市币种" prop="marginCoinData">
          <el-checkbox-group
            v-model="form.marginCoinData"
            @change="handleChange"
          >
            <el-checkbox
              v-for="(item, index) in marList"
              :key="index"
              :label="item"
            ><span>{{ item }}</span>
              <el-input
                v-model="val[item]"
                placeholder="最低保证金"
                :disabled="disabled[index]"
                class="box-input"
                size="mini"
              /></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="做市账号状态" prop="openFlag">
          <el-radio-group v-model="form.openFlag">
            <el-radio
              v-for="(item, index) in openFlagTypes"
              :key="index"
              :label="item.openFlag"
            >{{ item.openFlagName }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注内容" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="5"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          :disabled="disabledSubmitForm"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getGrant, updateGrant } from '@/api/marketgrant/grant'
import { userInfo, getUserAssets } from '@/api/marketgrant/marketUserInfo'
import { listCoinMar } from '@/api/contract/margin'
import { levelList } from '@/api/marketgrant/marketLevel'
export default {
  name: '',
  props: ['msg'],
  data() {
    var checkQuota = (rule, value, callback) => {
      value.forEach((element) => {
        if (!this.val[element]) {
          callback(new Error('请选择币种并输入限额'))
        }
      })
      if (value === '') {
        callback(new Error('请选择币种'))
      } else {
        callback()
      }
    }
    return {
      loading: true,
      loading2: true,
      marketId: undefined,
      disabledSubmitForm: false,
      disabled: [],
      // 修改弹窗
      open: false,
      // 修改信息表单
      form: {
        userId: this.msg.uid
      },
      marList: [],
      val: [],
      queryParams: {
        uid: this.msg.uid
      },
      capitalData: [],
      openFlagTypes: [
        {
          openFlag: 0,
          openFlagName: '封禁'
        },
        {
          openFlag: 1,
          openFlagName: '正常'
        },
        {
          openFlag: 2,
          openFlagName: '暂停做市资格'
        }
      ],
      levelTypes: [],
      levelIdOptions: [],
      tableData: [
        {
          scene: 'uid',
          colName: '用户ID',
          colValue: this.msg.uid,
          isLink: true,
          hasButton: undefined,
          colLabel: this.msg.uid
        },
        {
          scene: 'phone',
          colName: '手机',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--'
        },
        {
          scene: 'email',
          colName: '邮箱',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--'
        },
        {
          scene: 'marketId',
          colName: '做市商ID',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--'
        },
        {
          scene: 'ctime',
          colName: '加入时间',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--'
        },
        {
          scene: 'levelId',
          colName: '做市商等级',
          colValue: undefined,
          isLink: false,
          hasButton: true,
          colLabel: '--'
        },
        {
          scene: 'marginCoins',
          colName: '做市币种',
          colValue: undefined,
          isLink: false,
          hasButton: true,
          colLabel: '--'
        },
        {
          scene: 'incomeRate',
          colName: '收益分成比例',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--'
        },
        {
          scene: 'lossRate',
          colName: '亏损承担比例',
          colValue: undefined,
          isLink: false,
          hasButton: undefined,
          colLabel: '--'
        },
        {
          scene: 'limitAmt',
          colName: '做市商阈值',
          colValue: undefined,
          isLink: false,
          hasButton: true,
          colLabel: '--'
        },
        {
          scene: 'invitationNum',
          colName: '有效邀请人数',
          colValue: undefined,
          isLink: true,
          hasButton: undefined,
          colLabel: '--'
        },
        {
          scene: 'remark',
          colName: '做市账号备注',
          colValue: undefined,
          isLink: false,
          hasButton: true,
          colLabel: '--'
        },
        {
          scene: 'openFlag',
          colName: '做市账号状态',
          colValue: undefined,
          isLink: false,
          hasButton: true,
          colLabel: '--'
        }
      ],
      rules: {
        userId: [
          { required: true, message: '用户ID不能为空', trigger: 'blur' }
        ],
        levelId: [
          { required: true, message: '做市商等级不能为空', trigger: 'blur' }
        ],
        marginCoinData: [
          {
            required: true,
            message: '授权币种（保证金币种）不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getMarLevelList()
    this.getMarList()
    this.getMarrAssets()
  },
  methods: {
    getMarrAssets() {
      this.loading2 = true
      getUserAssets(this.queryParams).then((response) => {
        if (response.code == 200) {
          this.capitalData = response.rows
          this.loading2 = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        userId: this.msg.uid,
        marginCoinData: [],
        openFlag: undefined,
        levelId: undefined,
        remark: undefined,
        limitAmt: undefined,
        limitAmtData: []
      }
      this.resetForm('form')
    },
    handleChange() {
      this.disabled = []
      this.marList.forEach((e) => {
        this.disabled.push(true)
      })
      this.form.marginCoinData.forEach((element) => {
        this.disabled[this.marList.indexOf(element)] = false
        this.val[element]
      })
      this.marList
        .filter((i) => !this.form.marginCoinData.includes(i))
        .forEach((e) => {
          this.$delete(this.val, e)
        })
    },
    /** 修改按钮操作 */
    handleWork() {
      this.reset()
      getGrant(this.marketId).then((response) => {
        this.form = response.data
        this.$set(this.form, 'marginCoinData', [])
        this.form.marginCoinData = response.data.marginCoin.split(',')
        if (response.data.limitAmt && response.data.limitAmt != '') {
          response.data.limitAmt.split(',').forEach((element) => {
            let key, value
            key = element.substring(0, element.indexOf(':'))
            value = element.substring(element.indexOf(':') + 1)
            this.$set(this.val, key, value)
          })
        }
        this.form.openFlag = response.data.openFlag
        this.form.levelId = response.data.levelId
        this.form.remark = response.data.remark
        this.open = true
        this.disabledSubmitForm = false
        this.open = true
        this.handleChange()
      })
    },
    // 取消
    cancel() {
      this.open = false
      this.disabledSubmitForm = false
      this.reset()
      this.getUserInfo()
    },
    // 做市等级列表
    getMarLevelList() {
      levelList().then((response) => {
        if (response.code == 200) {
          this.levelIdOptions = response.rows
          this.getUserInfo()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            response.rows.forEach((e) => {
              this.marList.push(e.marginCoin)
            })
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getUserInfo() {
      this.loading = true
      userInfo(this.queryParams).then((res) => {
        const map = new Map(Object.entries(res.data))
        this.handleData(map)
        this.loading = false
      })
    },
    // 提交表单
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.disabledSubmitForm = true
          this.form.limitAmtData = []
          this.form.marginCoinData.forEach((element) => {
            if (this.val[element]) {
              this.form.limitAmtData.push(element + ':' + this.val[element])
            }
          })
          this.form.limitAmt = this.form.limitAmtData.join(',')
          const data = {
            id: this.marketId,
            levelId: this.form.levelId,
            marginCoin: this.form.marginCoinData.join(','),
            openFlag: this.form.openFlag,
            remark: this.form.remark,
            limitAmt: this.form.limitAmt
          }
          updateGrant(data)
            .then((response) => {
              if (response.code == 200) {
                this.msgSuccess('修改成功！')
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
    // 构建表格数据
    handleData(data) {
      this.tableData.forEach((element) => {
        if (data.get(element.scene) != null) {
          if (element.scene == 'ctime') {
            element.colLabel = this.parseTime(data.get(element.scene))
          } else if (element.scene == 'marketId') {
            element.colValue = data.get(element.scene)
            element.colLabel = data.get(element.scene)
            this.marketId = data.get(element.scene)
          } else if (element.scene == 'openFlag') {
            element.colValue = data.get(element.scene)
            this.openFlagTypes.forEach((e) => {
              if (e.openFlag == data.get(element.scene)) {
                element.colLabel = e.openFlagName
              }
            })
          } else if (element.scene == 'levelId') {
            element.colValue = data.get(element.scene)
            this.levelIdOptions.forEach((e) => {
              if (e.levelId == data.get(element.scene)) {
                element.colLabel = e.levelName + '做市商'
              }
            })
          } else if (
            element.scene == 'marginCoins' ||
            element.scene == 'limitAmt'
          ) {
            const reg = new RegExp(',', 'g')
            element.colValue = data.get(element.scene).split(',')
            element.colLabel = data.get(element.scene).replace(reg, '、')
          } else if (
            element.scene == 'incomeRate' ||
            element.scene == 'lossRate'
          ) {
            element.colValue = data.get(element.scene)
            element.colLabel = data.get(element.scene) * 100 + '%'
          } else {
            element.colLabel = data.get(element.scene)
          }
        }
      })
    },
    // 跳转
    toUserInfo(row) {
      if (row.scene == 'invitationNum') {
        // 跳邀请列表
        this.$router.push({
          name: 'userinvitationlist',
          query: {
            uid: this.msg.uid
          }
        })
      } else {
        // 跳用户详情
        sessionStorage.setItem('uid', row.colValue)
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect/lookInfo2/index'
          })
        })
      }
    }
  }
}
</script>

<style scoped>
.btn-primary {
  margin-left: 15px;
}
.box-input {
  width: 95px;
  margin-left: 10px;
}
</style>
