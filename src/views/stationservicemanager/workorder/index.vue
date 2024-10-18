<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="78px">
      <el-form-item label="用户ID" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系方式" prop="contactWay">
        <el-select v-model="queryParams.contactWay" placeholder="请选择联系方式" clearable>
          <el-option label="微信" :value="1" />
          <el-option label="邮箱" :value="2" />
          <el-option label="手机号" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系号码" prop="contactInfo">
        <el-input
          v-model="queryParams.contactInfo"
          placeholder="请输入联系方式"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="mini">
          <el-option label="待处理" :value="0" />
          <el-option label="已处理" :value="1" />
          <el-option label="关闭" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人ID" prop="opUid">
        <el-input
          v-model="queryParams.opUid"
          placeholder="请输入操作人ID"
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

    <el-table v-loading="loading" border :data="orderList">
      <el-table-column label="用户ID" align="center" prop="uid" />
      <el-table-column label="联系方式" align="center" prop="contactWay">
        <template slot-scope="scope">
          <span v-if="scope.row.contactWay==1">微信</span>
          <span v-if="scope.row.contactWay==2">邮箱</span>
          <span v-if="scope.row.contactWay==3">手机号</span>
        </template>
      </el-table-column>
      <el-table-column label="联系号码" align="center" prop="contactInfo" />
      <el-table-column label="问题描述" align="center" prop="desc" />
      <el-table-column :label="$t('common.status')" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status==0">待处理</span>
          <span v-if="scope.row.status==1">已处理</span>
          <span v-if="scope.row.status==2">关闭</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人ID" align="center" prop="opUid" />
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
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
import { listOrder } from '@/api/message/workorder'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      orderList: [],
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        contactWay: undefined,
        contactInfo: undefined,
        status: undefined,
        opUid: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      listOrder(this.queryParams).then(response => {
        this.orderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        uid: undefined,
        contactWay: undefined,
        contactInfo: undefined,
        desc: undefined,
        status: '0',
        opUid: undefined,
        exchId: undefined
      }
      this.resetForm('form')
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
