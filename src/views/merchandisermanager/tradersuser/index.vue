<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="120px">
      <el-form-item label="跟随用户ID：" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入跟随用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="跟随交易员ID：" prop="guidesUserId">
        <el-input
          v-model="queryParams.guidesUserId"
          placeholder="请输入交易员ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="跟单状态：" prop="followStatus">
        <el-select v-model="queryParams.followStatus" placeholder="请选择跟单状态" clearable size="mini">
          <el-option
            v-for="item in followStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="guidesList" border>
      <el-table-column label="跟随用户ID" align="center" prop="userId" />
      <el-table-column label="跟随交易员ID" align="center" prop="guidesUserId" />
      <el-table-column label="跟随币种" align="center" prop="currency" />
      <el-table-column label="跟单方式" align="center" prop="followType">
        <template slot-scope="scope">
          <span v-if="scope.row.followType=='1'">固定金额</span>
          <span v-if="scope.row.followType=='2'">比例</span>
        </template>
      </el-table-column>
      <el-table-column label="跟单本金/单位基准" align="center" prop="threshold" />
      <el-table-column label="单日跟随本金" align="center" prop="dailyAmount" />
      <el-table-column label="最大持仓本金" align="center" prop="totalPostion" />
      <el-table-column label="止损比例" align="center" prop="stopLossRate" />
      <el-table-column label="创建时间" align="center" prop="created">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.created) }}</span>
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
import { selectFollowSetList } from '@/api/system/guides'
export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 跟单用户信息表格数据
      guidesList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      followStatus: [
        {
          value: '1',
          label: '开启'
        },
        {
          value: '2',
          label: '关闭'
        },
        {
          value: '3',
          label: '取消跟随'
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        guidesUserId: undefined,
        followStatus: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询跟单用户信息列表 */
    getList() {
      this.loading = false
      selectFollowSetList(this.queryParams).then(response => {
        this.guidesList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    }
  }
}
</script>
