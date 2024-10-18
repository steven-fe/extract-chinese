<template>
  <div class="app-container">
    <el-form ref="queryParams" :model="queryParams" :inline="true">
      <el-form-item label="用户ID" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品ID" prop="goodsId">
        <el-select
          v-model="queryParams.goodsId"
          clearable
          size="mini"
          placeholder="请选择商品ID"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in goodsList"
            :key="index"
            :label="item.goodsId"
            :value="item.goodsId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="保证金币种" prop="marginCoin" label-width="90px">
        <el-select
          v-model="queryParams.marginCoin"
          clearable
          size="mini"
          placeholder="请选择保证金币种"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in marginList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单ID" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入订单ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单类型" prop="orderType">
        <el-select
          v-model="queryParams.orderType"
          clearable
          placeholder="请选择订单类型"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="item in ordTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择订单状态"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="item in ordStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓位类型" prop="positionType">
        <el-select
          v-model="queryParams.positionType"
          placeholder="请选择仓位类型"
          clearable
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="item in ordPosTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="平仓类型" prop="closeType">
        <el-select
          v-model="queryParams.closeType"
          clearable
          placeholder="请选择平仓类型"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="item in closeTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="杠杆倍数" prop="multiple">
        <el-select
          v-model="queryParams.multiple"
          clearable
          placeholder="请选择杠杆倍数"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="item in multipleOptions"
            :key="item.lever"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
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
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" border :data="tableList">
      <el-table-column label="订单ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="uid" width="100" />
      <el-table-column
        label="商品ID"
        align="center"
        prop="goodsId"
        width="100"
      />
      <el-table-column label="订单类型" align="center" prop="orderType">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in ordTypeOptions" :key="key">
            <span v-if="scope.row.orderType == item.value">{{
              item.label
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="status">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in ordStatusOptions" :key="key">
            <span v-if="scope.row.status == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="仓位类型" align="center" prop="positionType">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in ordPosTypeOptions" :key="key">
            <span v-if="scope.row.positionType == item.value">{{
              item.label
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="平仓类型" align="center" prop="closeType">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in closeTypeOptions" :key="key">
            <span v-if="scope.row.closeType == item.value">{{
              item.label
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="杠杆倍数" align="center" prop="multiple">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in multipleOptions" :key="key">
            <span v-if="scope.row.multiple == item.value">{{
              item.label
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="买入价格"
        align="center"
        prop="buyPrice"
        width="150"
      />
      <el-table-column
        label="爆仓价格"
        align="center"
        prop="burstPrice"
        width="150"
      />
      <el-table-column
        label="平仓时间"
        align="center"
        prop="burstTime"
        width="180"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.burstTime">{{
            parseTime(scope.row.burstTime)
          }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column
        label="平仓价格"
        align="center"
        prop="closePrice"
        width="150"
      />
      <el-table-column
        label="强平价格"
        align="center"
        prop="flatPrice"
        width="150"
      />
      <el-table-column
        label="盈亏值"
        align="center"
        prop="profitAmount"
        width="150"
      />
      <el-table-column
        label="资金费用"
        align="center"
        prop="fundingFee"
        width="150"
      />
      <el-table-column
        label="保证金币种"
        align="center"
        prop="marginCoin"
        width="150"
      />
      <el-table-column
        label="开仓保证金"
        align="center"
        prop="openRecognizance"
        width="150"
      />
      <el-table-column
        label="买入手续费"
        align="center"
        prop="openFee"
        width="150"
      />
      <el-table-column
        label="卖出手续费"
        align="center"
        prop="closeFee"
        width="150"
      />
      <el-table-column
        label="每日手续费"
        align="center"
        prop="dayFeeAmount"
        width="150"
      />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listGoods } from '@/api/contract/goods'
import { list, exportList } from '@/api/contract/expOrder'
import { expMarList } from '@/api/contract/expConfig'
export default {
  name: '',

  data() {
    return {
      time: undefined,
      tableList: [],
      total: 0,
      // 订单类型
      ordTypeOptions: [
        {
          value: '1',
          label: '买涨'
        },
        {
          value: '2',
          label: '买跌'
        }
      ],
      // 平仓类型
      closeTypeOptions: [
        {
          value: '0',
          label: '初始化'
        },
        {
          value: '1',
          label: '用户平仓'
        },
        {
          value: '2',
          label: '系统强平'
        },
        {
          value: '3',
          label: '止盈止损'
        },
        {
          value: '4',
          label: '追加强平'
        },
        {
          value: '5',
          label: '自动减仓'
        }
      ],
      // 订单状态
      ordStatusOptions: [
        { value: undefined, label: this.$t('common.all') },
        {
          value: '1',
          label: '持仓'
        },
        {
          value: '2',
          label: '平仓'
        },
        {
          value: '3',
          label: '爆仓'
        },
        {
          value: '6',
          label: '待平仓'
        }
      ],
      marginList: [],
      // 仓位类型
      ordPosTypeOptions: [
        {
          value: '1',
          label: '全仓'
        },
        {
          value: '2',
          label: '逐仓'
        }
      ],
      goodsList: [],
      // 杠杆倍数
      multipleOptions: [
        { label: '1X', value: '1' },
        { label: '2X', value: '2' },
        { label: '3X', value: '3' },
        { label: '5X', value: '5' },
        { label: '10X', value: '10' },
        { label: '20X', value: '20' },
        { label: '50X', value: '50' },
        { label: '100X', value: '100' }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: undefined,
        endTime: undefined,
        uid: undefined,
        goodsId: undefined,
        marginCoin: undefined,
        id: undefined,
        orderType: undefined,
        closeType: undefined,
        status: undefined,
        positionType: undefined
      }
    }
  },
  created() {
    this.getGoodsList()
    this.getExpMarList()
  },
  mounted() {
    this.queryParams.id = this.$route.query.refId
    this.getList()
  },
  methods: {
    getExpMarList() {
      this.loading = true
      expMarList().then((response) => {
        if (response.code == 200) {
          this.marginList = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.time = undefined
      this.resetForm('queryParams')
      this.handleQuery()
    },
    /** 查询订单列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = this.time ? this.time[0] : undefined
      this.queryParams.endTime = this.time ? this.time[1] : undefined
      list(this.queryParams).then((response) => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getGoodsList() {
      this.loading = true
      listGoods().then((response) => {
        if (response.code == 200) {
          this.goodsList = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出用户体验金下单数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportList(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>

<style scoped>
</style>
