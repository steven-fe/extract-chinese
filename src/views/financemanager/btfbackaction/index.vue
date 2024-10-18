<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="75px">
      <el-form-item label="排序规则" prop="sort">
        <el-select v-model="queryParams.sort" size="mini" placeholder="请选择排序规则">
          <el-option
            v-for="(item, index) in sortList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="被邀请人ID" prop="beuserId" label-width="110px">
        <el-input
          v-model="queryParams.beuserId"
          placeholder="请输入被邀请人ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="邀请人ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入邀请人id"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期：" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="daterange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="actionList" border>
      <el-table-column label="返佣日期" align="center" prop="transactionTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.transactionTime,'{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="beuserId" />
      <el-table-column label="保证金币种" align="center" prop="goodsId" />
      <el-table-column label="订单数量" align="center" prop="totalCount" />
      <el-table-column label="交易金额" align="center" prop="totalRecognizance" />
      <el-table-column label="手续费" align="center" prop="totalFee" />
      <el-table-column label="邀请人" align="center" prop="userId" />
      <el-table-column label="BTF返佣金额" align="center" prop="invitationValue" />
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
import {
  listAction,
  exportAction
} from '@/api/finance/invitationBTFBLPBackAction'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 返佣明细表格数据
      actionList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        goodsId: undefined,
        beuserId: undefined,
        sort: 1,
        transactionTime: undefined
      },
      sortList: [
        { label: '按日期排序', value: 1 },
        { label: '按累计交易金额排序', value: 2 },
        { label: '按累计交易笔数排序', value: 3 }
      ],
      pickerOptions: this.limitDate(),
      choseDate: undefined
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询返佣明细列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listAction(this.queryParams).then((response) => {
        this.actionList = response.rows
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
        exchId: undefined,
        userId: undefined,
        beuserId: undefined,
        rakeBackType: undefined,
        invitationLevel: undefined,
        invitationValue: undefined,
        transactionTime: undefined,
        goodsId: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    limitDate() {
      return {
        onPick: (time) => {
          if (time.minDate) {
            this.choseDate = time.minDate.getTime()
          }
          if (time.maxDate) {
            this.choseDate = undefined
          }
        },
        disabledDate: (time) => {
          const one = 1 * 24 * 3600 * 1000
          if (!this.choseDate) {
            // return time.getTime() > Date.now();
          } else {
            return (
              // time.getTime() > Date.now() ||
              time.getTime() < this.choseDate ||
              time.getTime() > this.choseDate + one * 7
            )
          }
        }
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出BTFBLP返佣详情数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportAction(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function(error) {})
    }
  }
}
</script>
