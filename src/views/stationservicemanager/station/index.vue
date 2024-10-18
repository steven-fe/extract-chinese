<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="发送内容" prop="sendContent">
        <el-input
          v-model="queryParams.sendContent"
          placeholder="请输入发送内容"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="消息类型" prop="messageType">
        <el-select v-model="queryParams.messageType" placeholder="请选择消息类型" clearable size="mini">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发送日期">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="语言" prop="messageLang">
        <el-select v-model="queryParams.messageLang" placeholder="请选择语言类型" clearable size="mini">
          <el-option
            v-for="item in languageOptions"
            :key="item.key"
            :label="item.language"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="mini">
          <el-option
            v-for="item in optionsStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:station:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="messageList" border>
      <el-table-column label="内容" align="center" prop="sendContent" />
      <el-table-column label="接收用户" align="center" prop="receiveUid">
        <template slot-scope="scope">
          <span v-if="scope.row.receiveUid=='all'">所有用户</span>
          <span v-else>{{ scope.row.receiveUid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="messageType">
        <template slot-scope="scope">
          <div v-if="scope.row.messageType === 1">系统消息</div>
          <div v-else-if="scope.row.messageType === 2">充值提现消息</div>
          <div v-else-if="scope.row.messageType === 3">合约消息</div>
          <div v-else-if="scope.row.messageType === 4">安全消息</div>
          <div v-else-if="scope.row.messageType === 5">认证消息</div>
        </template>
      </el-table-column>
      <el-table-column label="语言" align="center" prop="messageLang">
        <template slot-scope="scope">
          <span>{{ filterLang(scope.row.messageLang) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1">已读</span>
          <span v-if="scope.row.status === 2">未读</span>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改站内信内容信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="接收类型">
          <el-radio v-model="isAll" :label="0">非所有用户</el-radio>
          <el-radio v-model="isAll" :label="1">所有用户</el-radio>
        </el-form-item>
        <el-form-item v-show="isAll==0" label="接收用户" prop="receiveUid">
          <el-input v-model="form.receiveUid" placeholder="多个接收者以“；”隔开，不填则默认发送给全部用户" clearable />
        </el-form-item>
        <el-form-item label="语言类型" prop="messageLang">
          <el-select v-model="form.messageLang" placeholder="请选择语言类型" clearable>
            <el-option
              v-for="item in languageOptions"
              :key="item.key"
              :label="item.language"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发送内容" prop="sendContent">
          <el-input v-model="form.sendContent" type="textarea" placeholder="请输入发送内容" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMessage, addMessage } from '@/api/message/station'
import { listConfig } from '@/api/system/languageconfig'

export default {
  name: 'Message',
  data() {
    const checkUid = (rule, value, callback) => {
      const nan = value.split(';').findIndex(item => Number.isNaN(+item))
      if (nan != -1) {
        return callback(new Error('接收用户格式不正确'))
      }
      callback()
    }
    return {
      optionsStatus: [ // 1已读 2未读
        { label: '已读', value: 1 },
        { label: '未读', value: 2 }
      ],
      // 语言选项
      languageOptions: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 站内信内容信息表格数据
      messageList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      isAll: 0,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        startTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        messageType: undefined, // 1-系统消息 2-充值提现 3-合约 4-安全 5-认证
        sendContent: undefined,
        messageLang: undefined,
        status: undefined // 状态 1已读 2未读
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        receiveUid: [
          { required: true, message: '接收用户不能为空', trigger: 'blur' },
          { validator: checkUid, trigger: 'blur' }
        ],
        sendContent: [
          { required: true, message: '发送内容不能为空', trigger: 'blur' }
        ],
        messageLang: [
          { required: true, messsage: '语言类型不能为空', trigger: 'blur' }
        ]
      },
      options: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '系统消息'
        },
        {
          value: '2',
          label: '充值提现消息'
        },
        {
          value: '3',
          label: '合约消息'
        },
        {
          value: '4',
          label: '安全消息'
        },
        {
          value: '5',
          label: '认证消息'
        }
      ]
    }
  },
  computed: {
    filterLang() {
      return (lang) => {
        const obj = this.languageOptions.find(item => item.key === lang)
        return (obj && obj.language) || ''
      }
    }
  },
  created() {
    this.getList()
    this.getLanguageselect()
  },
  methods: {
    /** 语言下拉结构 */
    getLanguageselect() {
      listConfig().then(response => {
        this.languageOptions = response.rows.filter(item => item.isOpen === 1)
        console.log('语言', this.languageOptions)
      })
    },
    /** 查询站内信内容信息列表 */
    getList() {
      console.log('当前列表')
      this.loading = true
      this.queryParams.startTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      // 去除无效参数
      for (const key in this.queryParams) {
        if (!this.queryParams[key]) {
          this.queryParams[key] = undefined
        }
      }
      listMessage(this.queryParams).then(response => {
        this.messageList = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        receiveUid: undefined,
        sendContent: undefined,
        messageLang: undefined,
        messageType: 1
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.time = undefined
      this.queryParams = {
        pageNo: 1,
        pageSize: 10,
        startTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        messageType: undefined,
        sendContent: undefined
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      // this.getLanguageselect();
      this.open = true
      this.title = '添加站内信内容信息'
    },
    /** 提交按钮 */
    submitForm: function() {
      if (this.isAll == 1) {
        this.form.receiveUid = '-1'
      }
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateMessage(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addMessage(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>
