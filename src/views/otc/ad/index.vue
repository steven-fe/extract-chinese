<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item
        label="UID:"
        prop="uid"
      >
        <el-input
          v-model="queryParams.uid"
          placeholder="UID"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item
        :label="$t('common.coin')"
        prop="currencyCode"
      >
        <el-select
          v-model="queryParams.coin"
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
        label="买卖:"
        prop="typeStatus"
      >
        <el-select
          v-model="queryParams.side"
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
        label="法币"
        prop="quoteCoin"
      >
        <el-select
          v-model="queryParams.payCoin"
          size="mini"
          clearable
          filterable
          placeholder="请选择法币"
        >
          <el-option
            v-for="(item, index) in ctcList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="国籍"
                    prop="countryCode">
        <el-select v-model="queryParams.country"
                   placeholder="请选择国籍">
          <el-option v-for="(item,index) in countrys"
                     :key="index"
                     :label="item.cnName"
                     :value="item.dialingCode"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item
        label="支付方式"
        prop="payment"
      >
        <el-select
          v-model="queryParams.payment"
          size="mini"
          placeholder="请选择支付方式"
        >
          <el-option
            v-for="(item,index) in paymentOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="广告状态:"
        prop="typeState"
      >
        <el-select
          v-model="queryParams.state"
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
      <el-form-item label="广告创建时间:">
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
      </el-form-item>
    </el-form>
    <el-table
      ref="table"
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        label="商户UID"
        align="center"
        prop="userId"
      />
      <el-table-column
        label="广告ID"
        align="center"
        prop="id"
      />
      <el-table-column
        :label="$t('common.coin')"
        align="center"
        prop="coin"
      />
      <el-table-column
        label="买卖"
        align="center"
        prop="side"
      >
        <template slot-scope="scope">
          <div
            v-for="(item, index, key) in typeOptions"
            :key="key"
          >
            <span v-if="scope.row.side.toLowerCase() == item.value.toLowerCase()">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="法币"
        align="center"
        prop="payCoin"
      />
      <!-- <el-table-column label="国籍"
                       align="center"
                       prop="country" /> -->
      <el-table-column
        label="商家(成单数/信用度)"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.orderCount }}/{{ scope.row.creditValue }}
        </template>
      </el-table-column>
      <el-table-column
        label="剩余/总量(USDT)"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.volume - scope.row.sell }}/{{ scope.row.volume }}
        </template>
      </el-table-column>
      <el-table-column
        label="限额"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.minTrade }}/{{ scope.row.maxTrade }}
        </template>
      </el-table-column>
      <el-table-column
        label="单价"
        align="center"
        prop="price"
      />
      <el-table-column
        label="支付方式"
        align="center"
        prop="payment"
      />
      <el-table-column
        :label="$t('common.status')"
        align="center"
        prop="state"
      >
        <template slot-scope="scope">
          <div
            v-for="(item, index, key) in stateOptions"
            :key="key"
          >
            <span v-if="item.value && scope.row.state == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="广告创建时间"
        align="center"
        prop="ctime"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="200"
        class-name
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleOffAd(scope.$index, scope.row)"
          >下架
          </el-button>
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

    <!-- 冻结恢复广告权限对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="adVisible"
      width="30%"
    >
      <span>是否下架该广告？</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="adVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { adList, offlineAd } from '@/api/otcAd'
import { getCountryList } from '@/api/user'
export default {
  name: 'Ad',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 商户列表
      dataList: [],
      adVisible: false,
      dialogForm: {},
      time: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        coin: undefined,
        payCoin: undefined,
        side: undefined,
        payment: undefined,
        country: undefined,
        state: undefined
      },
      // 广告状态
      stateOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '上线'
        },
        {
          value: '0',
          label: '下线'
        }
      ],
      // 买入卖出状态
      typeOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'BUY',
          label: '买入'
        },
        {
          value: 'SELL',
          label: '卖出'
        }
      ],
      ctcList: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'INR',
          label: 'INR'
        },
        {
          value: 'VND',
          label: 'VND'
        }
      ],
      countrys: [],
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
      paymentOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'bt_india',
          label: '银行转账（印度）'
        },
        {
          value: 'upi',
          label: 'UPI'
        },
        {
          value: 'bt_vietnam',
          label: '银行转账（越南）'
        }
      ]
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList'])
    // codeOptions () {
    //   return this.currencyList
    // }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 列表 */
    getList() {
      adList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 国家编码
    countryList() {
      getCountryList()
        .then((response) => {
          if (response.code == 200) {
            this.countrys = response.data
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      if (!this.queryParams.uid) {
        this.queryParams.uid = undefined
      }
      if (!this.queryParams.coin) {
        this.queryParams.coin = undefined
      }
      if (!this.queryParams.payCoin) {
        this.queryParams.payCoin = undefined
      }
      if (!this.queryParams.side) {
        this.queryParams.side = undefined
      }
      if (!this.queryParams.payment) {
        this.queryParams.payment = undefined
      }
      if (!this.queryParams.country) {
        this.queryParams.country = undefined
      }
      if (this.queryParams.state == '') {
        this.queryParams.state = undefined
      }
      if (this.time && this.time[0]) {
        this.queryParams.ctimeStart = this.time[0]
        // this.queryParams.ctimeStart = new Date(this.time && this.time[0]).getTime()
      } else {
        this.queryParams.ctimeStart = undefined
      }
      if (this.time && this.time[1]) {
        this.queryParams.ctimeEnd = this.time[1]
        // this.queryParams.ctimeEnd = new Date(this.time && this.time[1]).getTime()
      } else {
        this.queryParams.ctimeEnd = undefined
      }
      this.getList()
    },
    handleOffAd(index, data) {
      this.dialogForm.id = data.id
      this.adVisible = true
    },
    handleConfirm() {
      offlineAd(this.dialogForm).then(response => {
        if (response.code === 200) {
          this.msgSuccess('下架成功')
          this.adVisible = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
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
    margin: 0 0 22px;
  }
}
</style>
