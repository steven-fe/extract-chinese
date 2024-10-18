<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item
        :label="$t('common.coin')"
        prop="currencyCode"
      >
        <el-select
          v-model="queryParams.currencyCode"
          filterable
          clearable
          size="mini"
          placeholder="请选择币种"
        >
          <el-option
            v-for="item in codeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="订单状态:"
        prop="orderState"
      >
        <el-select
          v-model="queryParams.orderState"
          size="mini"
          clearable
          :placeholder="$t('common.all')"
        >
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="广告类型:"
        prop="advertType"
      >
        <el-select
          v-model="queryParams.advertType"
          size="mini"
          clearable
          :placeholder="$t('common.all')"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="UID/手机号/邮箱:"
        prop="queryKey"
      >
        <el-input
          v-model="queryParams.queryKey"
          placeholder="UID/手机号/邮箱"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item
        label="订单ID:"
        prop="orderId"
      >
        <el-input
          v-model="queryParams.orderId"
          placeholder="订单ID"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item
        label="广告ID:"
        prop="advertId"
      >
        <el-input
          v-model="queryParams.advertId"
          placeholder="广告ID"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item label="创建时间:">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查找</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="table"
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        label="广告ID"
        align="center"
        prop="adsId"
      />
      <el-table-column
        label="订单ID"
        align="center"
        prop="sequence"
      />
      <el-table-column
        label="买方ID"
        align="center"
        prop="buyerId"
      />
      <el-table-column
        label="买方姓名"
        align="center"
        width="60"
        prop="buyerName"
      />
      <el-table-column
        label="买方手机号"
        align="center"
        width="60"
        prop="buyerPhone"
      />
      <el-table-column
        label="卖方ID"
        align="center"
        prop="sellerId"
      />
      <el-table-column
        label="卖方姓名"
        align="center"
        width="60"
        prop="sellerName"
      />
      <el-table-column
        label="卖方手机号"
        align="center"
        width="60"
        prop="sellerPhone"
      />
      <el-table-column
        label="交易数量"
        align="center"
        prop="volume"
      />
      <el-table-column
        label="交易金额"
        align="center"
        prop="totalPrice"
      />
      <!-- <el-table-column label="备注信息"
                       align="center"
                       prop="" /> -->
      <!-- <el-table-column label="聊天记录"
                       align="center"
                       prop="" /> -->
      <el-table-column
        label="订单状态"
        align="center"
        prop="status"
      />
      <el-table-column
        label="交易完成时间"
        align="center"
        width="80"
        prop="mtime"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="80"
        class-name
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleExpand(scope.$index, scope.row)"
          >展开
          </el-button>
          <!-- <el-button size="mini"
                     type="danger"
                     @click="handleOrderState(scope.$index, scope.row, 1)">
            回滚订单状态
          </el-button> -->
        </template>
      </el-table-column>
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form
            label-position="top"
            inline
            class="demo-table-expand"
          >
            <el-row class="second-line">
              <el-form-item label="广告发布者ID">
                <span>{{ scope.row.adsUserId }}</span>
              </el-form-item>
              <el-form-item label="广告类型">
                <span>{{ scope.row.adsSide }}</span>
              </el-form-item>
              <el-form-item label="交易价格">
                <span>{{ scope.row.adsPrice }}</span>
              </el-form-item>
              <el-form-item label="成交数量">
                <span>{{ scope.row.adsVolume }}</span>
              </el-form-item>
              <el-form-item label="付款方式">
                <span>{{ scope.row.adsPayment }}</span>
              </el-form-item>
              <el-form-item label="创建时间">
                <span>{{ scope.row.adsCreateTime }}</span>
              </el-form-item>
              <el-form-item label="广告状态">
                <span>{{ scope.row.adsStatus }}</span>
              </el-form-item>
            </el-row>
            <el-divider />
            <el-row class="pay-box">
              <el-col :span="10">
                <el-divider>买家信息</el-divider>
                <el-form-item label="姓名">
                  <span>{{ scope.row.buyerName }}</span>
                </el-form-item>
                <el-form-item label="收款方式">
                  <span>{{ scope.row.payment }}</span>
                </el-form-item>
                <el-form-item label="账号">
                  <span />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                &nbsp;
              </el-col>
              <el-col :span="10">
                <el-divider>卖家信息</el-divider>
                <el-form-item label="姓名">
                  <span>{{ scope.row.sellerName }}</span>
                </el-form-item>
                <el-form-item label="收款方式">
                  <span>{{ scope.row.payment }}</span>
                </el-form-item>
                <el-form-item label="账号">
                  <span>{{ scope.row.payAccount }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
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
import { mapState, mapActions } from 'vuex'
import { orderList, exportOrder } from '@/api/otcOrder'
export default {
  name: 'LowAuth',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 商户列表
      dataList: [],
      time: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        currencyCode: undefined,
        queryKey: undefined,
        orderState: undefined,
        advertType: undefined,
        orderId: undefined,
        advertId: undefined,
        startTime: undefined,
        endTime: undefined
      },
      // 是否显示弹出层
      open: false,
      dialogTitle: '',
      // 添加、修改弹窗表单参数
      dialogForm: {},
      adVisible: false,
      adText: '',
      operation: 1, // 1：添加， 2：修改
      codeOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'USDT',
          label: 'USDT'
        }
      ],
      typeOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '市价'
        },
        {
          value: '2',
          label: '限价'
        }
      ],
      // 订单状态
      stateOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '待付款'
        },
        {
          value: '2',
          label: '待放币'
        },
        {
          value: '3',
          label: '已完成'
        },
        {
          value: '4',
          label: '申诉中'
        },
        {
          value: '5',
          label: '已取消'
        }
      ],
      // 冻结、恢复弹窗参数
      stateForm: {},
      // 表单校验
      rules: {
        uid: [
          { required: true, message: '用户UID不能为空', trigger: 'blur' }
        ],
        premiumMoney: [
          { required: true, message: '商户保证金不能为空', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '昵称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // ...mapState('systemsetting', ['currencyList']),
    // codeOptions () {
    //   return this.currencyList
    // }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 商户列表 */
    getList() {
      orderList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      if (!this.queryParams.currencyCode) {
        this.queryParams.currencyCode = undefined
      }
      if (!this.queryParams.queryKey) {
        this.queryParams.queryKey = undefined
      }
      if (!this.queryParams.orderState) {
        this.queryParams.orderState = undefined
      }
      if (!this.queryParams.advertType) {
        this.queryParams.advertType = undefined
      }
      if (!this.queryParams.orderId) {
        this.queryParams.orderId = undefined
      }
      if (!this.queryParams.advertId) {
        this.queryParams.advertId = undefined
      }
      if (this.time && this.time[0]) {
        // this.queryParams.startTime = this.time[0]
        this.queryParams.startTime = new Date(this.time && this.time[0]).getTime()
      } else {
        this.queryParams.startTime = undefined
      }
      if (this.time && this.time[1]) {
        // this.queryParams.endTime = this.time[1]
        this.queryParams.endTime = new Date(this.time && this.time[1]).getTime()
      } else {
        this.queryParams.endTime = undefined
      }
      this.getList()
    },
    /** 导出按钮操作 */
    handleExport() {
      const params = {
        currencyCode: this.queryParams.currencyCode,
        orderState: this.queryParams.orderState,
        advertType: this.queryParams.advertType,
        queryKey: this.queryParams.queryKey,
        orderId: this.queryParams.orderId,
        advertId: this.queryParams.advertId
      }
      if (this.time && this.time[0]) {
        params.startTime = new Date(this.time && this.time[0]).getTime()
      }
      if (this.time && this.time[1]) {
        params.endTime = new Date(this.time && this.time[1]).getTime()
      }
      this.$confirm('是否确认导出场外订单？', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return exportOrder(params)
      })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() { })
    },
    handleExpand(index, row) {
      const $table = this.$refs.table
      $table.toggleRowExpansion(row)
    },
    handleOrderState() {

    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.dialogForm = {

      }
      this.resetForm('dialogForm')
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    .el-col {
      margin-right: 10px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
    }
  }
  .el-form-item {
    margin: 0 0 15px;
  }
  .el-form-item__content {
    line-height: 30px;
  }
  .second-line {
    .el-form-item {
      margin: 0;
      width: 13%;
      text-align: center;
    }
  }
  .pay-box {
    .el-form-item {
      margin: 0;
      width: 30%;
      text-align: center;
    }
  }
}
</style>
