<template>
  <div class="app-container">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">

      <el-form-item label="任务ID">
        <el-input v-model="queryParams.taskId" placeholder="请输入任务ID" size="mini" clearable />
      </el-form-item>

      <el-form-item label="模板消息ID">
        <el-input v-model="queryParams.templateMsgId" placeholder="请输入模板消息ID" size="mini" clearable />
      </el-form-item>

      <el-form-item label="消息类型">
        <el-select v-model="queryParams.msgType" size="small" placeholder="请选择消息类型" clearable>
          <el-option v-for="item in msgTypeOptions" :key="item.type" :label="item.typeName" :value="item.type" />
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

    <!--table-->
    <el-table v-loading="loading" border :data="tableData">

      <el-table-column prop="taskId" label="任务ID" width="150px" align="center" />

      <el-table-column prop="title" label="标题" width="150px" align="center" />

      <el-table-column prop="content" label="内容" width="150px" align="center" />

      <el-table-column prop="jumpUrl" label="跳转链接" width="260px" align="center" />

      <el-table-column prop="receiveType" label="接收用户UID" width="150px" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.receiveType === 1 || scope.row.receiveType === 2" type="primary" size="mini" @click="downloadUid(scope.row)">下载Excel</el-button>
          <span v-if="scope.row.receiveType === 0">全站用户</span>
        </template>
      </el-table-column>

      <el-table-column prop="msgType" label="消息类型" width="150px" align="center">
        <template slot-scope="scope">
          {{ msgTypeFn(scope.row.msgType) }}
        </template>
      </el-table-column>

      <el-table-column prop="templateMsgId" label="模板消息id" width="150px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.templateMsgId === null"> - </span>
          <span v-else>{{ scope.row.templateMsgId }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="messageLang" label="语言" width="150px" align="center">
        <template slot-scope="scope">
          {{ languageFn(scope.row.messageLang) }}
        </template>
      </el-table-column>

      <el-table-column prop="appNotice" label="App通知" width="150px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.appNotice === 0">否</span>
          <span v-if="scope.row.appNotice === 1">是</span>
        </template>
      </el-table-column>

      <el-table-column prop="ctime" label="发送时间" width="160px" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

  </div>
</template>

<script>
import { listConfig } from '@/api/system/languageconfig'
import { getMsgRecordList, downLoadUid, getMsgType } from '@/api/operate/messageCenter'
export default {
  data() {
    return {
      time: '',
      queryParams: {
        taskId: '',
        templateMsgId: '',
        msgType: '',
        sendStartTs: '',
        sendEndTs: '',
        pageNum: 1,
        pageSize: 20
      },
      total: 0,
      loading: true,
      tableData: [],
      msgTypeOptions: [],
      languageOptions: []
    }
  },
  mounted() {
    listConfig().then(res => {
      if (res.code === 200) {
        this.languageOptions = res.rows
      }
    })
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
      getMsgRecordList(this.queryParams).then(res => {
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
    downloadUid(rows) {
      const params = {
        taskId: rows.taskId,
        lanCode: rows.messageLang
      }
      downLoadUid(params).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.msgSuccess('下载成功')
        } else {
          this.msgError('下载失败')
        }
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
        taskId: '',
        templateMsgId: '',
        msgType: '',
        pageNum: 1,
        pageSize: 20
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    languageFn(str) {
      if (str) {
        const strLang = str.split(',').map(item => {
          const obj = this.languageOptions.find(el => el.key === item)
          return obj ? obj.language : ''
        }).join(',')
        return strLang
      }
      return ''
    },
    msgTypeFn(num) {
      if (num) {
        const msgTypeName = this.msgTypeOptions.find(el => {
          if (el.type === num) {
            return el
          }
        })
        return msgTypeName.typeName
      }
    }
  }
}
</script>
