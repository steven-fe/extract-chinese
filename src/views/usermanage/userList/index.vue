<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="like " placeholder="模糊查询" size="mini" clearable />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="authLevel" size="mini" clearable placeholder="请选择状态">
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-date-picker
            v-model="startDate"
            size="mini"
            align="right"
            type="date"
            placeholder="选择开始日期"
            :picker-options="pickerOptions"
          />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-date-picker
            v-model="endDate"
            size="mini"
            align="right"
            type="date"
            placeholder="选择结束日期"
            :picker-options="pickerOptions"
          />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="load()">{{$t('common.search')}}</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table
      v-loading="loading"
      border
      class="top"
      col-class-name="button"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <el-table-column prop="id" label="用户ID" width="180" />
      <el-table-column prop="userRealName" label="姓名" width="180" />
      <el-table-column prop="email" label="邮箱号" width="180" />
      <el-table-column prop="phone" label="手机号" width="180" />
      <el-table-column label="BTFBLP身份验证码" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.authenticationCode">{{ scope.row.authenticationCode }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="注册IP" width="150" />
      <el-table-column prop="shareCode" label="我的推荐码" width="180" />
      <el-table-column prop="invitationcode" label="被邀请码" width="150" />
      <el-table-column prop="status" label="认证级别" width="150">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in levelOptions" :key="key">
            <span v-if="scope.row.auth_level == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="用户身份" width="120">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.auth_level == '2' && scope.row.underwriterFlag == '承销商'"
            size="mini"
            type="success"
            @click="changeUser(false,scope.row.id)"
          >承销商</el-button>
          <el-button
            v-if="scope.row.auth_level == '2' && scope.row.underwriterFlag != '承销商'"
            size="mini"
            type="danger"
            @click="changeUser(true,scope.row.id)"
          >普通用户</el-button>
          <span v-if="scope.row.auth_level != '2' && scope.row.underwriterFlag != '承销商'">普通用户</span>
        </template>
      </el-table-column>
      <el-table-column prop="created" label="创建时间" width="160" />
      <el-table-column :label="$t('common.operation')" fixed="right" width="250">
        <template slot-scope="scope">
          <el-row type="flex" justify="space-around">
            <el-col :span="10">
              <el-button
                v-if="scope.row.login_status == '1'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 0,1)"
              >冻结登录</el-button>
              <el-button
                v-if="scope.row.login_status == '0'"
                size="mini"
                type="danger"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 1,1)"
              >登录解冻</el-button>
              <el-button
                v-if="scope.row.withdraw_status == '1'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 0,2)"
              >冻结提现</el-button>
              <el-button
                v-if="scope.row.withdraw_status == '0'"
                size="mini"
                type="danger"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 1,2)"
              >提现解冻</el-button>
              <el-button
                v-if="scope.row.invitation_open == '1'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 0, 6)"
              >关闭返佣</el-button>
              <el-button
                v-if="scope.row.invitation_open == '0'"
                size="mini"
                type="danger"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 1, 6)"
              >开启返佣</el-button>
              <el-button
                size="mini"
                style="margin-left: 0px;"
                @click="handleEdit(scope.$index, scope.row)"
              >查看</el-button>
            </el-col>

            <el-col :span="10">
              <el-button
                v-if="scope.row.contract_exc_status == '1'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 0,5)"
              >冻结合约交易</el-button>
              <el-button
                v-if="scope.row.contract_exc_status == '0'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                type="danger"
                @click="changeStatus(scope.row.id, 1,5)"
              >合约交易解冻</el-button>
              <el-button
                v-if="scope.row.otc_exc_status == '1'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 0,4)"
              >冻结otc交易</el-button>
              <el-button
                v-if="scope.row.otc_exc_status == '0'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                type="danger"
                @click="changeStatus(scope.row.id, 1,4)"
              >otc交易解冻</el-button>
              <el-button
                v-if="scope.row.futures_open == '1'"
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 0, 7)"
              >关闭期权</el-button>
              <el-button
                v-if="scope.row.futures_open == '0'"
                size="mini"
                type="danger"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeStatus(scope.row.id, 1, 7)"
              >开启期权</el-button>
            </el-col>

            <!-- <el-col :span="8">
              <el-button
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeGA(scope.row.id)"
              >解绑谷歌</el-button>
              <el-button
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeUserEmail(scope.row.id)"
              >更换邮箱</el-button>
              <el-button
                size="mini"
                style="margin-left: 0px; margin-bottom: 5px;"
                @click="changeUserMobile(scope.row.id)"
              >更换手机</el-button>
            </el-col> -->
          </el-row>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="95px">
        <el-form-item v-if="changetype==1" label="国家区号：" prop="contryCode">
          <el-select v-model="form.contryCode" placeholder="请选择国家区号">
            <el-option
              v-for="(item,index) in countrys"
              :key="index"
              :label="item.cnName+item.dialingCode"
              :value="item.dialingCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="accounttitle" prop="newaccount">
          <el-input v-model="form.newaccount" placeholder="请输入新账号" />
        </el-form-item>
        <el-form-item label="原因：" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="5" placeholder="请输入原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>

    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="load"
      />
    </div>
    <!-- <look-info></look-info> -->
  </div>
</template>
<script>
import {
  listUser,
  updateUserStatus,
  add,
  delBatch,
  updateUserMobile,
  updateUserEmail,
  delUserGA,
  getCountryList
} from '@/api/user'

export default {
  name: 'UserList',

  data() {
    return {
      tableData1: [],
      loading: true,
      pageShow: true,
      isTure: true,
      dialogVisible: false,
      title: undefined,
      accounttitle: undefined,
      changetype: undefined, // 表单校验
      rules: {
        newaccount: [
          { required: true, message: '新账号不能为空', trigger: 'blur' }
        ],
        reason: [{ required: true, message: '原因不能为空', trigger: 'blur' }]
      },
      form: {},
      // 日期快捷选项
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date())
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          },
          {
            text: '一周前',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }
        ]
      },
      // 币种下拉
      levelOptions: [
        {
          value: '0',
          label: '未认证'
        },
        {
          value: '1',
          label: '初级认证'
        },
        {
          value: '2',
          label: '高级认证'
        }
      ],
      like: '',
      authLevel: '',
      startDate: '',
      endDate: '',
      pageSize: 10,
      pageNum: 1,
      tableData: [],
      total: 0,
      formLabelWidth: '140px',
      countrys: []
    }
  },
  created() {
    this.load()
    this.countryList()
  },
  methods: {
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
    changeUser(status, index) {
      this.$confirm('此操作将改变用户身份, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          if (status) {
            add(index)
              .then((response) => {
                this.load()
                this.$message({
                  showClose: true,
                  message: this.$t('common.operationSucceed'),
                  type: 'success'
                })
              })
              .catch((error) => {
                console.log(error)
              })
          } else {
            delBatch({ idList: [index] })
              .then((response) => {
                this.load()
                this.$message({
                  showClose: true,
                  message: this.$t('common.operationSucceed'),
                  type: 'success'
                })
              })
              .catch((error) => {
                console.log(error)
              })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 更换手机
    changeUserMobile(uid) {
      this.changetype = 1
      this.dialogVisible = true
      this.title = '更换手机号'
      this.accounttitle = '新手机号：'
      this.form = {
        uid: uid,
        contryCode: '+86'
      }
    },
    // 解绑谷歌
    changeGA(uid) {
      this.$prompt('请输入原因', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel')
      })
        .then(({ value }) => {
          const formData = {
            uid: uid,
            reason: value
          }
          delUserGA(formData)
            .then((response) => {
              this.load()
              this.$message({
                showClose: true,
                message: '解绑成功',
                type: 'success'
              })
            })
            .catch((error) => {
              console.log(error)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作取消'
          })
        })
    },
    // 更换邮箱
    changeUserEmail(uid) {
      this.changetype = 2
      this.dialogVisible = true
      this.title = '更换邮箱'
      this.accounttitle = '新邮箱：'
      this.form = {
        uid: uid
      }
    },
    // 关闭弹窗
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = {
        uid: undefined,
        newaccount: undefined,
        reason: undefined,
        contryCode: '+86'
      }
    },
    handleEdit(row, index) {
      let userPhone
      if (index.phone) {
        userPhone = index.phone
      } else {
        userPhone = index.email
      }
      sessionStorage.setItem('userId', index.id)
      sessionStorage.setItem('userPhone', userPhone)
      this.$router.push({ name: 'lookInfo' })
    },
    changeStatus(userId, changeStatus, type) {
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
          updateUserStatus(formData)
            .then((response) => {
              this.load()
              this.$message({
                showClose: true,
                message: this.$t('common.operationSucceed'),
                type: 'success'
              })
            })
            .catch((error) => {
              console.log(error)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
    },
    // 加载
    load() {
      this.loading = true
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        authLevel: this.authLevel,
        like: this.like,
        startTime: this.formatDate(this.startDate),
        endTime: this.formatDate(this.endDate)
      }

      listUser(formData)
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
    enable(row, column, cellValue) {
      if (cellValue == 0) {
        return '冻结'
      } else {
        return '正常'
      }
    },
    authenticateT(row, column, cellValue) {
      for (let i = 0; i < this.levelOptions.length; i++) {
        if (this.levelOptions[i].value == cellValue) {
          return this.levelOptions[i].label
        }
      }
    },
    // 索引值
    indexMethod(index) {
      return index + (this.pageNum - 1) * this.pageSize + 1
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.changetype == 1) {
            const data = {
              uid: this.form.uid,
              mobile: this.form.newaccount,
              reason: this.form.reason,
              contryCode: this.form.contryCode
            }
            updateUserMobile(data)
              .then((response) => {
                if (response.code == 200) {
                  this.msgSuccess('更换成功！')
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                console.log(error)
              })
          } else {
            const data = {
              uid: this.form.uid,
              email: this.form.newaccount,
              reason: this.form.reason
            }
            updateUserEmail(data)
              .then((response) => {
                if (response.code == 200) {
                  this.msgSuccess('更换成功！')
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                console.log(error)
              })
          }
          this.cancel()
          this.load()
        }
      })
    },
    // 日期处理
    formatDate(time) {
      if (time) {
        const date = new Date(time)
        const year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        if (month < 10) {
          month = '0' + month
        }
        if (day < 10) {
          day = '0' + day
        }
        return year + '-' + month + '-' + day
      } else {
        return ''
      }
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

.cell button {
  width: 100%;
}
</style>
