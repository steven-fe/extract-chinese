<template>
  <div class="app-container">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">

      <el-form-item label="任务ID">
        <el-input v-model="queryParams.id" placeholder="请输入消息任务ID" size="mini" clearable />
      </el-form-item>

      <el-form-item label="模板消息ID">
        <el-input v-model="queryParams.templateMsgId" placeholder="请输入模板消息ID" size="mini" clearable />
      </el-form-item>

      <el-form-item label="消息类型">
        <el-select v-model="queryParams.msgType" size="small" placeholder="请选择消息类型" clearable>
          <el-option v-for="item in msgTypeOptions" :key="item.type" :label="item.typeName" :value="item.type" />
        </el-select>
      </el-form-item>

      <el-form-item label="发送状态">
        <el-select v-model="queryParams.sendState" size="small" placeholder="请选择状态" clearable>
          <el-option v-for="item in stateOptions" :key="item.value" :label="item.name" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="发送时间">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          format="yyyy-MM-dd HH:mm"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button type="primary" size="mini" @click="resetQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <div style="margin-bottom: 20px;">
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增消息任务</el-button>
    </div>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData">

      <el-table-column prop="id" label="任务ID" width="150px" align="center" />

      <el-table-column :label="$t('common.operation')" width="300px" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.sendState === 0 && scope.row.sendType !== 0" type="primary" size="mini" @click="handleModify(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.sendState === 0 && scope.row.sendType !== 0" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" @click="handleCopy(scope.row)">复制</el-button>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="标题" width="150px" align="center" />

      <el-table-column prop="content" label="内容" width="150px" align="center" />

      <el-table-column prop="jumpUrl" label="跳转链接" width="260px" align="center" />

      <el-table-column prop="msgTypeName" label="消息类型" width="150px" align="center" />

      <el-table-column prop="appNotice" label="App通知" width="150px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.appNotice === 0">否</span>
          <span v-if="scope.row.appNotice === 1">是</span>
        </template>
      </el-table-column>

      <el-table-column prop="sendState" label="发送状态" width="150px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.sendState === 0">未发送</span>
          <span v-if="scope.row.sendState === 1">已发送</span>
        </template>
      </el-table-column>

      <el-table-column prop="realSendTs" label="发送时间" width="160px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.realSendTs === 0"> - </span>
          <span v-else>{{ parseTime(scope.row.realSendTs) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="opUserName" :label="$t('financemanager.operator')" width="160px" align="center" />
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

  </div>
</template>

<script>
import { getMsgTaskList, getMsgType, deleteMsgTask } from '@/api/operate/messageCenter'
export default {
  data() {
    return {
      time: undefined,
      type: '', // add 新增, edit 修改, cope 复制
      queryParams: {
        id: '',
        templateMsgId: '',
        msgType: '',
        sendState: '',
        sendStartTs: '',
        sendEndTs: '',
        pageNum: 1,
        pageSize: 20
      },
      loading: true,
      tableData: [],
      total: 0,
      msgTypeOptions: [],
      stateOptions: [
        { value: '0', name: '未发送' },
        { value: '1', name: '已发送' }
      ]
    }
  },
  created() {
    this.getList()
    this.getSendMsgType()
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.sendStartTs = (this.time && this.time[0]) || ''
      this.queryParams.sendEndTs = (this.time && this.time[1]) || ''
      getMsgTaskList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        } else {
          this.tableData = []
          this.msgError(res.msg)
        }
        this.loading = false
      })
    },
    getSendMsgType() {
      getMsgType().then(res => {
        if (res.code === 200) {
          this.msgTypeOptions = res.data
        } else {
          this.msgError(res.msg)
        }
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.time = ''
      this.queryParams = {
        id: '',
        templateMsgId: '',
        msgType: '',
        sendState: '',
        pageNum: 1,
        pageSize: 20
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.type = 'add'
      this.$router.push({ name: 'addMessageTask', query: { type: this.type }})
    },
    handleModify({ id }) {
      this.type = 'edit'
      this.$router.push({ name: 'modifyMessageTask', query: { id, type: this.type }})
    },
    handleCopy({ id }) {
      this.type = 'copy'
      this.$router.push({ name: 'addMessageTask', query: { id, type: this.type }})
    },
    handleDelete({ id }) {
      this.$confirm('确认要删除这条任务吗？', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deleteMsgTask({ id }).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
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
    }
  }
}
</script>
