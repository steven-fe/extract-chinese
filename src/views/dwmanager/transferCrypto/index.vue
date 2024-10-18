<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="125px" :rules="ruleForm">
      <el-form-item :label="$t('common.coin')" prop="currencyCode">
        <el-select
          v-model="queryParams.currencyCode"
          size="mini"
          filterable
          clearable
          :placeholder="$t('common.all')"
        >
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="付款用户登录账号" prop="transferOutUserAccount">
        <el-input
          v-model="queryParams.transferOutUserAccount"
          clearable
          size="mini"
          placeholder="请输入邮箱/手机号"
        />
      </el-form-item>
      <el-form-item label="付款用户UID" prop="transferOutUserUid">
        <el-input
          v-model="queryParams.transferOutUserUid"
          clearable
          size="mini"
          placeholder="请输入付款用户UID"
        />
      </el-form-item>
      <el-form-item label="转账时间" prop="time">
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
      <el-form-item label="转账状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择转账状态" size="mini" clearable>
          <el-option
            v-for="item in statuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收款用户UID" prop="transferInUserUid">
        <el-input
          v-model="queryParams.transferInUserUid"
          clearable
          size="mini"
          placeholder="请输入收款用户UID"
        />
      </el-form-item>
      <el-form-item label="收款用户收款账号" prop="transferInUserAccount">
        <el-input
          v-model="queryParams.transferInUserAccount"
          clearable
          size="mini"
          placeholder="请输入收款用户收款账号"
        />
      </el-form-item>
      <el-form-item label="转账方向" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择转账方向" size="mini" clearable>
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
        <el-button type="primary" size="mini" @click="handleSet">转账配置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="cryptoList">
      <el-table-column label="转账号" align="center" prop="id" />
      <el-table-column label="转账方向" align="center" prop="type" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 0">转出</span>
          <span v-if="scope.row.type === 1">转入</span>
        </template>
      </el-table-column>
      <el-table-column label="付款用户UID">
        <template slot-scope="scope">
          <span v-if="scope.row.transferOutUserUid">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.transferOutUserUid }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="付款用户登录账号" align="center" prop="transferOutUserAccount" />
      <el-table-column label="转账币种" align="center" prop="currencyCode" />
      <el-table-column label="转账时间" align="center" prop="updatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="转账金额" align="center" prop="amount" />
      <el-table-column label="收款用户UID" align="center" prop="transferInUserUid" width="280" />
      <el-table-column label="收款用户账号" align="center" prop="transferInUserAccount" />
      <el-table-column label="转账状态" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1">{{$t('dwmanager.beingProcessed')}}</span>
          <span v-if="scope.row.status === 2">已完成</span>
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
    <el-dialog
      title="转账配置"
      :visible.sync="open"
      width="35%"
      :before-close="cancel"
    >
      <div class="dialog-content">
        <el-form
          ref="digForm"
          :model="digForm"
          :rules="rules"
          class="form-grid"
          label-position="left"
        >
          <el-form-item
            label="每日发起转账次数"
            :label-width="formLabelWidth"
            prop="dayInitiateCount"
          >
            <el-input
              v-model="digForm.dayInitiateCount"
              placeholder="请输入每日发起转账次数"
            />
          </el-form-item>
          <el-form-item
            label="每日接受转账次数"
            :label-width="formLabelWidth"
            prop="dayAcceptCount"
          >
            <el-input
              v-model="digForm.dayAcceptCount"
              placeholder="请输入每日接受转账次数"
            />
          </el-form-item>
          <el-form-item
            label="72小时内发起转账次数预警"
            :label-width="formLabelWidth"
            prop="seventyTwoInitiateMonitor"
          >
            <el-input
              v-model="digForm.seventyTwoInitiateMonitor"
              placeholder="请输入72小时内发起转账次数预警"
            />
          </el-form-item>
          <el-form-item
            label="72小时内接受转账次数预警"
            :label-width="formLabelWidth"
            prop="seventyTwoAcceptMonitor"
          >
            <el-input
              v-model="digForm.seventyTwoAcceptMonitor"
              placeholder="请输入72小时内接受转账次数预警"
            />
          </el-form-item>
          <el-form-item
            label="Lark机器人Token"
            :label-width="formLabelWidth"
            prop="larkBotToken"
          >
            <el-input
              v-model="digForm.larkBotToken"
              placeholder="请输入Lark机器人Token"
            />
          </el-form-item>

        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleSave"
        >保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { pageList, listExport, queryInfo, transferEdit } from '@/api/finance/depositCrypto'

export default {
  data() {
    const checkdayInitiateCount = (rule, value, callback) => {
      if (!value) {
        callback(new Error('每日发起转账次数不能为空'))
      }
      var reg = /^[1-9]\d*$/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('必须是正整数'))
        } else {
          callback()
        }
      }
    }
    const checkdayAcceptCount = (rule, value, callback) => {
      if (!value) {
        callback(new Error('每日接受转账次数不能为空'))
      }
      var reg = /^[1-9]\d*$/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('必须是正整数'))
        } else {
          callback()
        }
      }
    }
    const checkseventyTwoInitiateMonitor = (rule, value, callback) => {
      if (!value) {
        callback(new Error('72小时内发起转账次数预警不能为空'))
      }
      var reg = /^[1-9]\d*$/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('必须是正整数'))
        } else {
          callback()
        }
      }
    }
    const checkseventyTwoAcceptMonitor = (rule, value, callback) => {
      if (!value) {
        callback(new Error('72小时内接受转账次数预警不能为空'))
      }
      var reg = /^[1-9]\d*$/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('必须是正整数'))
        } else {
          callback()
        }
      }
    }
    const checktransferOutUserUid = (rule, value, callback) => {
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('请输入正确格式的UID'))
        } else {
          callback()
        }
      }
    }
    const checktransferInUserUid = (rule, value, callback) => {
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('请输入正确格式的UID'))
        } else {
          callback()
        }
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      cryptoList: [],
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        currencyCode: '',
        transferOutUserAccount: undefined,
        transferOutUserUid: undefined,
        beginTime: undefined,
        endTime: undefined,
        status: undefined,
        transferInUserUid: undefined,
        transferInUserAccount: undefined,
        type: undefined
      },
      typeOptions: [
        { label: '转出', value: 0 },
        { label: '转入', value: 1 }
      ],
      formLabelWidth: '200px',
      digForm: {},
      // 表单校验
      rules: {
        dayInitiateCount: [
          { required: true, validator: checkdayInitiateCount, trigger: 'blur' }
        ],
        dayAcceptCount: [
          { required: true, validator: checkdayAcceptCount, trigger: 'blur' }
        ],
        seventyTwoInitiateMonitor: [
          { required: true, validator: checkseventyTwoInitiateMonitor, trigger: 'blur' }
        ],
        seventyTwoAcceptMonitor: [
          { required: true, validator: checkseventyTwoAcceptMonitor, trigger: 'blur' }
        ],
        larkBotToken: [
          { required: true, message: 'Lark机器人Token不能为空', trigger: 'blur' }
        ]
      },
      // 筛选框校验
      ruleForm: {
        transferOutUserUid: [
          { validator: checktransferOutUserUid, trigger: 'blur' }
        ],
        transferInUserUid: [
          { validator: checktransferInUserUid, trigger: 'blur' }
        ]
      },
      statuses: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: this.$t('dwmanager.beingProcessed')
        },
        {
          value: '2',
          label: '已完成'
        }
      ]
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 货币转账列表
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      pageList(this.queryParams).then(response => {
        this.cryptoList = response.rows
        this.total = response.total
        this.loading = false
      })
      // let response = {
      //     "total":2,
      //     "rows":[
      //         {
      //             "id":1,
      //             "transferOutUserUid":100285552220,
      //             "transferOutUserAccount":"test@qq.com",
      //             "currencyCode":"USDT",
      //             "updatedAt":1611749922366,
      //             "amount": 100000,
      //             "transferInUserUid":100285552221,
      //             "transferInUserAccount":"abc@qq.com",
      //             "status":1
      //         },
      //         {
      //             "id":2,
      //             "transferOutUserUid":100285552220,
      //             "transferOutUserAccount":"test@qq.com",
      //             "currencyCode":"USDT",
      //             "updatedAt":1611749922388,
      //             "amount": 200000,
      //             "transferInUserUid":100285552221,
      //             "transferInUserAccount":"abc@qq.com",
      //             "status":1
      //         }
      //     ],
      //     "summaryRows":null,
      //     "code":200,
      //     "msg":0,
      //     "data":null
      // };
      // this.cryptoList = response.rows;
      // this.total = response.total;
      // this.loading = false;
    },
    //  搜索按钮操作
    handleQuery() {
      console.log(this.queryParams.transferOutUserUid)
      if (this.queryParams.transferOutUserUid == undefined && this.queryParams.transferInUserUid == undefined) {
        this.queryParams.pageNum = 1
        this.getList()
      } else {
        this.$refs['queryForm'].validateField(['transferOutUserUid', 'transferInUserUid'], (errorMessage) => {
          if (!errorMessage) {
            this.queryParams.pageNum = 1
            this.getList()
          }
        })
      }
    },
    handleQuery1() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.transferOutUserUid)
      sessionStorage.setItem('userId', row.transferInUserId)
      this.$router.push({ name: 'lookInfo2' })
    },
    cancel() {
      this.open = false
      this.$refs['digForm'].resetFields()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.handleQuery1()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有数字货币转账数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return listExport(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    },
    // 转账配置弹窗
    handleSet() {
      this.open = true
      queryInfo().then(response => {
        if (response.code === 200) {
          this.digForm = response.data
        }
      })
      // let res = {
      //     "code": 200,
      //     "msg": 0,
      //     "data":{
      //         "dayInitiateCount":1000,
      //         "dayAcceptCount":1000,
      //         "seventyTwoInitiateMonitor":1000,
      //         "seventyTwoAcceptMonitor":1000,
      //         "larkBotToken":"321312312321312"
      //     }
      // }
      // this.digForm = res.data;
    },
    // 转账配置弹窗 确定按钮
    handleSave() {
      const params = {
        dayInitiateCount: this.digForm.dayInitiateCount,
        dayAcceptCount: this.digForm.dayAcceptCount,
        seventyTwoInitiateMonitor: this.digForm.seventyTwoInitiateMonitor,
        seventyTwoAcceptMonitor: this.digForm.seventyTwoAcceptMonitor,
        larkBotToken: this.digForm.larkBotToken
      }
      this.$refs['digForm'].validate(valid => {
        if (valid) {
          transferEdit(params).then(response => {
            if (response.code === 200) {
              this.msgSuccess(this.$t('common.operationSucceed'))
              this.cancel()
              this.getList()
            }
          })
        }
      })
    }
  }
}
</script>
