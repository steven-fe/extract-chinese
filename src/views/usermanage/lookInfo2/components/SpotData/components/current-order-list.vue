<template>
  <div style="padding-bottom: 20px">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="币对" prop="instrumentId" label-width="40px">
        <el-select
          v-model="queryParams.instrumentId"
          size="mini"
          filterable
          clearable
          placeholder="请选择币对"
        >
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="(item,index) in pairList"
            :key="index"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成交状态" prop="state">
        <el-select v-model="queryParams.state" size="mini" clearable placeholder="请选择状态">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in statuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单号">
        <el-input v-model="queryParams.orderId" size="mini" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="委托方向" prop="side">
        <el-select v-model="queryParams.side" placeholder="请选择委托方向" size="mini" clearable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in sides"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下单来源" prop="orderSource">
        <el-select v-model="queryParams.orderSource" placeholder="请选择下单来源" size="mini" clearable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in orderSourceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
        <el-button type="primary" size="mini" @click="handleBatchCancelAndFreeze">一键撤单并冻结</el-button>
        <el-button type="primary" size="mini" @click="handleBatchCancelOrder">一键仅撤单</el-button>
        <el-button type="warning" size="mini" @click="exportExcel">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <!-- table -->
    <el-table v-loading="loading" border :data="cryptoList" @selection-change="handleSelectionChange">
      <el-table-column label="委托订单号" align="center" prop="orderId" width="180" />
      <el-table-column label="委托方向" align="center" prop="side" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.side === -1">卖出</span>
          <span v-if="scope.row.side === 1">买入</span>
        </template>
      </el-table-column>
      <el-table-column label="委托时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.timestamp) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="委托数量" align="center" prop="orderQtyMsg" width="180" />
      <el-table-column label="委托类型" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.type === 1 ? '限价' : scope.row.type === 2 ? '市价' : 'POST_ONLY' }}</template>
      </el-table-column>
      <el-table-column label="委托价格($)" align="center" prop="orderPriceMsg" width="180" />
      <el-table-column label="委托金额($)" align="center" prop="orderAmtMsg" width="180" />
      <el-table-column label="成交数量" align="center" prop="execQtyMsg" width="180" />
      <el-table-column label="成交金额($)" align="center" prop="execAmtMsg" width="180" />
      <el-table-column label="交易对" align="center" prop="instrumentName" width="180" />
      <el-table-column :label="$t('common.status')" align="center" prop="state" width="180">
        <template slot-scope="scope">
          <span v-for="(item, index) in statuses" :key="index">
            <span v-if="scope.row.state == item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="下单来源" align="center" prop="orderSource" width="180">
        <template slot-scope="scope">
          <span v-for="(item, index) in orderSourceOptions" :key="index">
            <span v-if="scope.row.orderSource == item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="API Key" align="center" prop="apiKey" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.apiKey !== null">{{ scope.row.apiKey }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" width="200">
        <template slot="header">
          操作
          <el-tooltip class="item" effect="dark" content="完成操作后，后台会根据执行情况返回执行结果" placement="top-start">
            <i class="el-icon-question" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleCancelFreeze(scope.row)">撤单并冻结</el-button>
          <el-button type="primary" size="mini" @click="handleCancelOrder(scope.row)">仅撤单</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 撤单并冻结弹窗 -->
    <el-dialog title="撤单并冻结" :visible.sync="cancelOrderFreezeDialog" :close-on-click-modal="false" :before-close="cancelAndFreezeClose" width="500px">
      <div v-show="show1" style="margin-bottom: 20px;">已选中{{ cancelAndFreezeLength }}条委托</div>
      <el-form ref="cancelOrderFreezeForm" :model="cancelOrderFreezeForm" label-width="80px">
        <el-form-item label="撤单备注">
          <el-input v-model="cancelOrderFreezeForm.cancelOrderRemark" placeholder="非必填" />
        </el-form-item>
        <el-form-item label="冻结备注">
          <el-input v-model="cancelOrderFreezeForm.frozzenRemark" placeholder="非必填" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAndFreezeClose">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="cancelAndFreezeSure">确 认</el-button>
      </div>
    </el-dialog>
    <!-- 单次冻结执行结果 -->
    <el-dialog :visible.sync="singleFreezeResultDialog" :close-on-click-modal="false" :before-close="closeFreezeResult" width="500px">
      <div style="margin: 0 auto; text-align: center;">
        <div>单次冻结执行结果</div>
        <div style="color: red; margin: 20px 0">冻结执行失败，请下载Excel文件，手动执行冻结。</div>
        <el-button type="primary" @click="downloadFreezeFailResult">下载执行冻结失败记录</el-button>
      </div>
    </el-dialog>
    <!-- 一键撤单&冻结执行结果 -->
    <el-dialog :visible.sync="onceCancelOrderFreezeResultDialog" :close-on-click-modal="false" :before-close="closeCancelAndFreeze" width="500px">
      <div class="resultBox">
        <div class="title">{{$t('frozen.cancellationResult')}}</div>
        <div class="tip">撤单执行失败，请下载Excel文件，重新进行撤单。</div>
        <div class="resultList">
          <div class="itemBox">
            <div class="tit">{{$t('frozen.totalNumberOfWithdrawalOrders')}}</div>
            <div class="des">{{ cancelResult.totalNum }}</div>
          </div>
          <div class="itemBox">
            <div class="tit">{{$t('frozen.cancellationResult')}}</div>
            <div class="des">{{$t('frozen.result', {successNum: cancelResult.successNum, failNum: cancelResult.failNum})}}</div>
          </div>
          <div class="itemBox">
            <div class="tit">下载执行撤单失败委托</div>
            <div class="des">
              <el-button v-if="cancelResult.failExcel !== null" type="primary" size="mini" @click="uploadCancelOrderFail">下载</el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-show="show3" class="resultBox">
        <div class="title">{{$t('frozen.freezeExecutionResults')}}</div>
        <div class="tip">冻结执行失败，请下载Excel文件，手动执行冻结。</div>
        <div class="resultList">
          <div class="itemBox">
            <div class="tit">{{$t('frozen.totalFrozenExecution')}}</div>
            <div class="des">{{ frozenResult.totalNum }}</div>
          </div>
          <div class="itemBox">
            <div class="tit">{{$t('frozen.freezeExecutionResults')}}</div>
            <div class="des">{{$t('frozen.result', {successNum: frozenResult.successNum, failNum: frozenResult.failNum})}}</div>
          </div>
          <div class="itemBox">
            <div class="tit">下载执行冻结失败记录</div>
            <div class="des">
              <el-button v-if="frozenResult.failExcel !== null" type="primary" size="mini" @click="uploadFreezeFail">下载</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 仅撤单弹窗 -->
    <el-dialog title="仅撤单" :visible.sync="cancelOrderDialog" :close-on-click-modal="false" :before-close="cancelOrderClose" width="500px">
      <div v-show="show2" style="margin-bottom: 20px;">已选中{{ cancelOrderLength }}条委托</div>
      <el-form ref="cancelOrderForm" :model="cancelOrderForm" label-width="80px">
        <el-form-item label="撤单备注">
          <el-input v-model="cancelOrderForm.cancelOrderRemark" placeholder="非必填" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelOrderClose">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleCancelOrderSure">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { getActiveOrderList, cancelAndFrozen, cancelOrder, batchCancelAndFrozen, batchCancel, getExport, getBatchCancelRecord, batchCancelExcel } from '@/api/userinfo/userInfo'
export default {
  name: 'CurrentOrderList',
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      cancelOrderFreezeDialog: false,
      cancelOrderDialog: false,
      singleFreezeResultDialog: false,
      onceCancelOrderFreezeResultDialog: false,
      show1: false,
      show2: false,
      show3: false,
      cancelOrderFreezeForm: {
        cancelOrderRemark: '',
        frozzenRemark: ''
      },
      cancelOrderForm: {
        cancelOrderRemark: ''
      },
      statuses: [
        { value: '2', label: '部分成交' },
        { value: '4', label: '未成交' }
      ],
      orderSourceOptions: [
        { value: 1, label: '客户端' },
        { value: 2, label: '普通API' },
        { value: 3, label: '官方API' }
      ],
      sides: [
        { value: '1', label: '买入' },
        { value: '-1', label: '卖出' }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        state: '',
        orderId: '',
        instrumentId: '',
        userId: this.userId,
        side: '',
        orderSource: ''
      },
      cryptoList: [],
      timer: null,
      recordData: '',
      selectArr: [],
      cancelAndFreezeLength: 0,
      freezeFileName: '',
      cancelOrderLength: 0,
      cancelAndFreezeOperateWay: '', // 0 单一操作，1 批量操作
      cancelOrderWay: '', // 0 单一操作，1 批量操作
      cancelAndFreezeObj: {},
      cancelOrderObj: {},
      cancelResult: {
        totalNum: 0,
        successNum: 0,
        failNum: 0,
        failExcel: null
      },
      frozenResult: {
        totalNum: 0,
        successNum: 0,
        failNum: 0,
        failExcel: null
      },
      optionsWay: '' // 1 一键批量撤单且冻结， 2 一键仅撤单
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList'])
  },
  created() {
    this.load()
    this.getPair()
    this.getBatchCancelRecord()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    ...mapActions('systemsetting', ['getPair']),
    // 加载
    load() {
      this.loading = true
      getActiveOrderList(this.queryParams).then(res => {
        this.cryptoList = res.data
        this.loading = false
      })
    },
    exportExcel() {
      getExport(this.queryParams).then(res => {
        this.download(res.data.fileName)
      })
    },
    handleSelectionChange(val) {
      this.cancelAndFreezeLength = val.length
      this.cancelOrderLength = val.length
      this.selectArr = []
      val.map(el => {
        this.selectArr.push({ userUid: el.uid, symbol: el.symbol, orderId: el.orderId })
      })
    },
    handleCancelFreeze(row) {
      this.show1 = false
      this.cancelAndFreezeOperateWay = 0
      this.cancelOrderFreezeDialog = true
      this.cancelAndFreezeObj = row
    },
    cancelAndFreezeClose() {
      this.cancelOrderFreezeDialog = false
      this.cancelOrderFreezeForm.cancelOrderRemark = ''
      this.cancelOrderFreezeForm.frozzenRemark = ''
    },
    async getBatchCancelRecord() {
      const { data } = await getBatchCancelRecord()
      // 0:进行中 1:处理完成， 当状态值为1 时 ，调用获取失败excel 接口
      this.recordData = data
      if (data && data.status === 1) {
        batchCancelExcel({ batchNo: data.batchNo }).then(res => {
          this.cancelResult = res.data.cancelResult
          if (res.data.frozenResult !== null) {
            this.frozenResult = res.data.frozenResult
          } else {
            this.frozenResult.totalNum = 0
            this.frozenResult.successNum = 0
            this.frozenResult.failNum = 0
            this.frozenResult.failExcel = null
          }
        })
        if (this.optionsWay !== '') {
          this.onceCancelOrderFreezeResultDialog = true
        }
      }
      if (data && data.status === 0 && !this.timer) {
        this.timer = setInterval(() => {
          if (!this.recordData || this.recordData.status !== 0) {
            clearInterval(this.timer)
            this.timer = null
          } else {
            this.getBatchCancelRecord()
          }
        }, 5000)
      }
    },
    uploadCancelOrderFail() {
      this.download(this.cancelResult.failExcel)
    },
    uploadFreezeFail() {
      this.download(this.frozenResult.failExcel)
    },
    cancelAndFreezeSure() {
      if (this.cancelAndFreezeOperateWay === 0) {
        const params = {
          userUid: this.cancelAndFreezeObj.uid,
          symbol: this.cancelAndFreezeObj.symbol,
          orderId: this.cancelAndFreezeObj.orderId,
          cancelOrderRemark: this.cancelOrderFreezeForm.cancelOrderRemark,
          frozenRemark: this.cancelOrderFreezeForm.frozzenRemark
        }
        cancelAndFrozen(params).then(res => {
          if (res.code === 200) {
            if (res.data) {
              this.singleFreezeResultDialog = true
              this.freezeFileName = res.data.fileName
            } else {
              this.msgSuccess('撤单并冻结操作已完成')
            }
          } else {
            this.msgError('撤单失败，不再继续执行冻结操作')
          }
          this.cancelAndFreezeClose()
          this.load()
        })
      } else {
        const params = {
          cancelRemark: this.cancelOrderFreezeForm.cancelOrderRemark,
          frozenRemark: this.cancelOrderFreezeForm.frozzenRemark,
          batchCancels: this.selectArr
        }
        batchCancelAndFrozen(params).then(res => {
          setTimeout(() => {
            this.getBatchCancelRecord()
          }, 1000)
          this.show3 = true
          this.optionsWay = 1
          this.cancelAndFreezeClose()
          this.load()
        })
      }
    },
    closeFreezeResult() {
      this.singleFreezeResultDialog = false
      this.load()
    },
    closeCancelAndFreeze() {
      this.onceCancelOrderFreezeResultDialog = false
      this.load()
      this.cancelResult.totalNum = 0
      this.cancelResult.successNum = 0
      this.cancelResult.failNum = 0
      this.cancelResult.failExcel = null
      this.frozenResult.totalNum = 0
      this.frozenResult.successNum = 0
      this.frozenResult.failNum = 0
      this.frozenResult.failExcel = null
    },
    downloadFreezeFailResult() {
      this.download(this.freezeFileName)
      this.singleFreezeResultDialog = false
    },
    handleBatchCancelAndFreeze() {
      this.cancelAndFreezeOperateWay = 1
      if (this.cancelAndFreezeLength < 1) {
        this.msgError('请选择委托订单')
        return
      }
      if (this.cancelAndFreezeLength >= 1) {
        this.cancelOrderFreezeDialog = true
        this.show1 = true
      }
    },
    handleBatchCancelOrder() {
      this.cancelOrderWay = 1
      if (this.cancelOrderLength < 1) {
        this.msgError('请选择委托订单')
        return
      }
      if (this.cancelOrderLength >= 1) {
        this.show2 = true
        this.cancelOrderDialog = true
      }
    },
    handleCancelOrder(row) {
      this.cancelOrderWay = 0
      this.show2 = false
      this.cancelOrderDialog = true
      this.cancelOrderObj = row
    },
    cancelOrderClose() {
      this.cancelOrderDialog = false
      this.cancelOrderForm.cancelOrderRemark = ''
    },
    handleCancelOrderSure() {
      if (this.cancelOrderWay === 0) {
        const params = {
          cancelOrderRemark: this.cancelOrderForm.cancelOrderRemark,
          userUid: this.cancelOrderObj.uid,
          symbol: this.cancelOrderObj.symbol,
          orderId: this.cancelOrderObj.orderId
        }
        cancelOrder(params).then(res => {
          if (res.code === 200) {
            this.cancelOrderClose()
            this.load()
            this.msgSuccess('撤单操作执行完成')
          } else {
            this.msgError(res.msg)
          }
        })
      } else {
        const params = {
          cancelRemark: this.cancelOrderForm.cancelOrderRemark,
          batchCancels: this.selectArr
        }
        batchCancel(params).then(res => {
          setTimeout(() => {
            this.getBatchCancelRecord()
          }, 1000)
          this.show3 = false
          this.optionsWay = 2
          this.cancelOrderClose()
          this.load()
        })
      }
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
.top {
  margin-top: 20px;
}
.resultBox {
  margin-bottom: 30px;
}
.title {
  color: black;
  font-size: 18px;
}
.tip {
  color: red;
  margin: 10px 0;
  padding-left: 79px;
}
.resultList {
  display: flex;
  justify-content: space-between;
  width: 460px;
  height: 100px;
  border: 1px solid #000;
}
.itemBox {
  width: 153px;
  text-align: center;
  border-right: 1px solid #000;
}
.itemBox:last-child {
  border: none;
}
.tit {
  width: 153px;
  height: 50px;
  border-bottom: 1px solid #000;
  line-height: 50px;
}
.des {
  height: 50px;
  line-height: 50px;
}
</style>
