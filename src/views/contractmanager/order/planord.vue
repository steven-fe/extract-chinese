<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
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
        <el-select v-model="queryParams.goodsId" size="mini" placeholder="请选择商品ID">
          <el-option
            v-for="(item, index) in goodsList"
            :key="index"
            :label="item.goodsId"
            :value="item.goodsId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="保证金币种" prop="marginCoin">
        <el-select v-model="queryParams.marginCoin" size="mini" placeholder="请选择保证金币种">
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
        <el-select v-model="queryParams.orderType" placeholder="请选择订单类型" clearable size="mini">
          <el-option
            v-for="item in ordTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable size="mini">
          <el-option
            v-for="item in ordStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓位类型" prop="positionType">
        <el-select v-model="queryParams.positionType" placeholder="请选择仓位类型" clearable size="mini">
          <el-option
            v-for="item in ordPosTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="杠杆倍数" prop="multiple">
        <el-select v-model="queryParams.multiple" placeholder="请选择杠杆倍数" clearable size="mini">
          <el-option
            v-for="item in multipleOptions"
            :key="item.lever"
            :label="item.leverName"
            :value="item.lever"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="委托时间">
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="orderList" border>
      <el-table-column label="订单ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="uid" />
      <el-table-column label="商品ID" align="center" prop="goodsId" width="100" />
      <el-table-column label="订单类型" align="center" prop="orderType">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in ordTypeOptions" :key="key">
            <span v-if="scope.row.orderType == item.value">{{ item.label }}</span>
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
            <span v-if="scope.row.positionType == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="杠杆倍数" align="center" prop="multiple">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in multipleOptions" :key="key">
            <span v-if="scope.row.multiple == item.lever">{{ item.leverName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="委托时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="委托价格" align="center" prop="buyPrice" />
      <el-table-column label="委托成交价格" align="center" prop="tradePrice" width="150" />
      <el-table-column label="当前价" align="center" prop="currentPrice" />
      <el-table-column label="保证金币种" align="center" prop="marginCoin" width="150" />
      <el-table-column label="保证金" align="center" prop="recognizance" />
      <!--
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope"></template>
      </el-table-column>-->
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
import { planOrdList, planOrdQuery } from '@/api/contract/order'
import { listLever } from '@/api/contract/lever'
import { listCoin } from '@/api/contract/margin'
import { listGoods } from '@/api/contract/goods'
export default {
  name: 'ContractPlanOrder',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 计划委托表格数据
      orderList: [],
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
      goodsList: [],
      // 订单状态
      ordStatusOptions: [
        {
          value: '1',
          label: '委托中'
        },
        {
          value: '2',
          label: '已挂单'
        },
        {
          value: '3',
          label: '已撤销'
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
      // 杠杆倍数
      multipleOptions: [],
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        uid: undefined,
        goodsId: undefined,
        marginCoin: undefined,
        id: undefined,
        orderType: undefined,
        status: undefined,
        positionType: undefined,
        multiple: undefined
      }
    }
  },
  created() {
    this.getLevList()
    this.getList()
    this.getMarginList()
    this.getGoodsList()
  },
  methods: {
    getLevList() {
      const params = {
        status: 1
      }
      listLever(params).then(response => {
        this.multipleOptions = this.unique(response.rows)
      })
    },
    /** 查询订单列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      planOrdList(this.queryParams).then(response => {
        this.orderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    unique(arr) {
      const res = new Map()
      return arr.filter(arr => !res.has(arr.lever) && res.set(arr.lever, 1))
    },
    getMarginList() {
      this.loading = true
      listCoin().then(response => {
        if (response.code == 200) {
          this.marginList = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getGoodsList() {
      this.loading = true
      listGoods().then(response => {
        if (response.code == 200) {
          this.goodsList = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.time = undefined
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        uid: undefined,
        goodsId: undefined,
        marginCoin: undefined,
        id: undefined,
        orderType: undefined,
        status: undefined,
        positionType: undefined,
        multiple: undefined
      }
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
