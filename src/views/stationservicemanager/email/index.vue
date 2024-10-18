<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="渠道商" prop="channel">
        <el-select v-model="queryParams.channel" placeholder="请选择渠道商" clearable size="mini">
          <el-option
            v-for="item in channelOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收件人地址" prop="to">
        <el-input
          v-model="queryParams.to"
          placeholder="请输入收件人地址"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="emailList" border>
      <el-table-column label="消息编号" align="center" prop="respEmailId" />
      <el-table-column label="收件人地址" align="center" prop="to" width="100px" />
      <el-table-column label="标题" align="center" prop="subject" />
      <el-table-column label="邮件内容" align="center" prop="content" width="400px" />
      <el-table-column label="返回码" align="center" prop="resCode" />
      <el-table-column label="返回描述" align="center" prop="resDesc" />
      <el-table-column label="渠道" align="center" prop="channel" />
      <el-table-column label="消息状态" align="center" prop="status" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt) }}</span>
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
  </div>
</template>

<script>
import { channelList, emailList } from '@/api/message/smsEmail'

export default {
  name: 'Email',
  data() {
    return {
      // 渠道商选项
      channelOptions: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 邮件发送记录表格数据
      emailList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        to: undefined,
        channel: undefined
      }
    }
  },
  created() {
    this.getChannelselect()
    this.getList()
  },
  methods: {
    /** 渠道商下拉结构 */
    getChannelselect() {
      const params = {
        type: '2'
      }
      channelList(params).then(response => {
        this.channelOptions = response.data
      })
    },
    /** 查询邮件发送记录列表 */
    getList() {
      this.loading = true
      emailList(this.queryParams).then(response => {
        this.emailList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
