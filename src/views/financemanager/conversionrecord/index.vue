<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="用户id" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户id"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="兑换类型" prop="sourceType">
        <el-select
          v-model="queryParams.sourceType"
          size="mini"
          filterable
          clearable
          placeholder="请选择币种"
        >
          <el-option label="手动兑换" value="1" />
          <el-option label="平仓转换" value="2" />
          <el-option label="返佣转换" value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="兑换方向" prop="tradeType">
        <el-select
          v-model="queryParams.tradeType"
          size="mini"
          filterable
          clearable
          placeholder="请选择兑换方向"
        >
          <el-option label="兑换BTFABC" value="1" />
          <el-option label="拆分BTFABC" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="recordList" border>
      <el-table-column label="兑换id" align="center" prop="id" />
      <el-table-column label="兑换时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="uid" />
      <el-table-column label="兑换类型" align="center" prop="sourceType">
        <template slot-scope="scope">
          <span v-if="scope.row.sourceType==1">手动兑换</span>
          <span v-if="scope.row.sourceType==2">平仓转换</span>
          <span v-if="scope.row.sourceType==3">返佣转换</span>
        </template>
      </el-table-column>
      <el-table-column label="兑换方向" align="center" prop="tradeType">
        <template slot-scope="scope">
          <span v-if="scope.row.tradeType==1">兑换BTFABC</span>
          <span v-if="scope.row.tradeType==2">拆分BTFABC</span>
        </template>
      </el-table-column>
      <el-table-column label="消耗1" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.consume1!=null">{{ scope.row.consume1 }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="消耗2" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.consume2!=null">{{ scope.row.consume2 }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="兑换1" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.conversion1!=null">{{ scope.row.conversion1 }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="兑换2" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.conversion2!=null">{{ scope.row.conversion2 }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="回购积分" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.scoreBackE!=null">{{ scope.row.scoreBackE }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="回购金额" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.amountBackE!=null">{{ scope.row.amountBackE }}</span>
          <span v-else>--</span>
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
import { listRecord, exportRecord } from '@/api/finance/conversionrecord'

export default {
  name: 'Record',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 币种兑换记录表格数据
      recordList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tradeType: undefined,
        uid: undefined,
        sourceCurrency: undefined,
        sourceAmount: undefined,
        scoreCurrency: undefined,
        scoreAmount: undefined,
        targetCurrency: undefined,
        targetAmount: undefined,
        status: undefined,
        sourceType: undefined,
        mtime: undefined,
        ctime: undefined,
        exchId: undefined,
        refId: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询币种兑换记录列表 */
    getList() {
      this.loading = true
      listRecord(this.queryParams).then((response) => {
        this.recordList = response.rows
        this.total = response.total
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
        id: undefined,
        tradeType: undefined,
        uid: undefined,
        sourceCurrency: undefined,
        sourceAmount: undefined,
        scoreCurrency: undefined,
        scoreAmount: undefined,
        targetCurrency: undefined,
        targetAmount: undefined,
        status: '0',
        sourceType: undefined,
        mtime: undefined,
        ctime: undefined,
        exchId: undefined,
        refId: undefined
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
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有币种兑换记录数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportRecord(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
