<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="活动id:" prop="activityId">
        <el-input v-model="queryParams.activityId" placeholder="活动id" clearable size="mini"/>
      </el-form-item>
      <el-form-item label="UID:" prop="uid">
        <el-input v-model="queryParams.uid" placeholder="UID" clearable size="mini" @blur="$event => queryParams.uid = $event.target.value.trim()"/>
      </el-form-item>
      <el-form-item label="国籍:" prop="country">
        <el-select v-model="countrySelect" size="mini" clearable filterable multiple collapse-tags placeholder="请选择国籍" @change="selectAllCountry">
          <el-option label="全选" value="all"/>
          <el-option v-for="(item,index) in countrys" :key="index" :label="item.cnName" :value="item.dialingCode"/>
        </el-select>
      </el-form-item>
      <el-form-item label="项目代币:" prop="currencyId">
        <el-select v-model="currencySelect" size="mini" clearable filterable multiple collapse-tags placeholder="请选择项目代币" @change="selectAllCurency">
          <el-option label="全选" value="all"/>
          <el-option v-for="item in tokenList" :key="item.activityId" :label="item.currencyCode" :value="item.currencyId"/>
        </el-select>
      </el-form-item>

      <el-form-item label="活动标签:" prop="tags">
        <el-select v-model="queryParams.tags" size="mini" clearable :placeholder="$t('common.all')">
          <el-option v-for="item in tagsOptions" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
      </el-form-item>

      <el-form-item label="认购模式:" prop="subscriptionType">
        <el-select v-model="queryParams.subscriptionType" size="mini" clearable placeholder="全部">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>

      <el-form-item label="当前状态:" prop="status">
        <el-select v-model="queryParams.status" size="mini" clearable :placeholder="$t('common.all')">
          <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
      </el-form-item>

      <el-form-item label="是否锁仓:" prop="islock">
        <el-select v-model="queryParams.islock" size="mini" clearable :placeholder="$t('common.all')">
          <el-option v-for="item in lockOptions" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="参与时间:">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">查询</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="dataList" border>
      <el-table-column label="Launchpad活动id" align="center" prop="activityId"/>
      <el-table-column label="Launchpad代币" align="center" prop="currencyCode"/>
      <el-table-column label="认购使用币种" align="center" prop="subCurrencyCode"/>
      <el-table-column label="活动标签" align="center" prop="tags"/>
      <el-table-column label="认购模式" align="center" prop="subscriptionType">
        <template slot-scope="scope">
          <div v-for="(item, index) in typeOptions" :key="index">
            <span v-if="scope.row.subscriptionType === item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dwmanager.userUID')">
        <template slot-scope="scope">
          <span v-if="scope.row.uid">
            <el-link type="primary" :underline="false" @click="toUserInfo(scope.row)">{{ scope.row.uid }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" prop="registerTime" width="160" />
      <el-table-column label="Kyc国籍" align="center" prop="authCountry" />
      <el-table-column label="首次登录IP所在地" align="center" prop="registerCountry" width="130" />
      <el-table-column label="参与活动额度" align="center" prop="joinQuota"/>
      <el-table-column label="参与活动币种" align="center" prop="subCurrencyCode"/>
      <el-table-column label="实际参与额度" align="center" prop="lastJoinQuota"/>
      <el-table-column label="实际参与币种" align="center" prop="subCurrencyCode"/>
      <el-table-column label="首次参与时间" align="center" prop="joinTime" width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.joinTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参与次数" align="center" prop="joinCount"/>
      <el-table-column label="KYC任务状态" align="center" prop="kyc" width="120">
        <template slot-scope="scope">
          <span>
            <template v-if="scope.row.kyc === '-'">-</template>
            <template v-else-if="scope.row.kyc == '0' || scope.row.kyc == '1'">未完成</template>
            <template v-else>已完成</template>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="任务期间现货交易额" align="center" prop="tradeQuota"/>
      <el-table-column label="任务期间入金数量" align="center" prop="recharge"/>
      <el-table-column label="任务期间入金币种" align="center" prop="rechargeCode"/>
      <el-table-column label="任务期间邀请人数" align="center" prop="invitation"/>
      <el-table-column label="基础额度" align="center" prop="baseQuota"/>
      <el-table-column label="当前额度" align="center" prop="currentQuota"/>
      <el-table-column label="当前状态" align="center" prop="currentStatus">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in stateOptions" :key="key">
            <span v-if="item.value && scope.row.currentStatus == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分配数量" align="center" prop="disNumber"/>
      <el-table-column label="是否到账" align="center" prop="isAccount"/>
      <el-table-column label="到账数量" align="center" prop="accountNumber"/>
      <el-table-column label="到账时间" align="center" prop="accountTime" width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.accountTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否锁仓" align="center" prop="islock">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in lockOptions" :key="key">
            <span v-if="scope.row.islock == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="应锁仓代币数量" align="center" prop="lockNumber"/>
      <el-table-column label="解锁方式" align="center" prop="unLockRule" width="300" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page-sizes="[10, 50, 2000]"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { userDetail, currencyList, exportPersonal } from '@/api/launchpad'
import { getCountryList } from '@/api/user'
export default {
  name: 'Launchpad',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      dataList: [],
      time: '',
      // 查询参数
      queryParams: {
        activityId: undefined,
        uid: undefined,
        pageNum: 1,
        pageSize: 10,
        countrys: undefined,
        currencyId: undefined,
        tags: undefined,
        // type: undefined,
        subscriptionType: undefined,
        islock: undefined,
        createTime: undefined,
        endTime: undefined
      },
      countrys: [],
      countrySelectAll: false, // country是否全选
      tokenList: [],
      countrySelect: [],
      currencySelect: [],
      currencySelectAll: false, // currency是否全选
      typeOptions: [
        { value: '', label: '全部' },
        { value: 0, label: '公开认购' },
        { value: 1, label: '白名单认购' }
      ],
      lockOptions: [
        { value: '', label: this.$t('common.all') },
        { value: '0', label: '未锁仓' },
        { value: '1', label: '锁仓' }
      ],
      stateOptions: [
        { value: '1', label: '认购中' },
        { value: '2', label: '分配中' },
        { value: '3', label: '已结束' },
        { value: '4', label: '已认购' }
      ],
      tagsOptions: [
        { id: '', name: '全部' },
        { id: 'Prime', name: 'Prime' },
        { id: 'Startup', name: 'Startup' },
        { id: 'Token-sale', name: 'Token-sale' }
      ],
      statusOptions: [
        { id: '', name: '全部' },
        { id: 2, name: '分配中' },
        { id: 3, name: '已结束' },
        { id: 4, name: '已认购' }
      ]
    }
  },
  computed: {

  },
  created() {
    this.getList()
    this.countryList()
    this.getTokenList()
  },
  methods: {
    // 国家编码
    countryList() {
      getCountryList()
        .then((response) => {
          if (+response.code === 200) {
            this.countrys = response.data
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    selectAllCountry(arr) {
      const index = arr.findIndex(item => item === 'all')
      if (index !== -1 && !this.countrySelectAll) {
        this.countrySelect = this.countrys.map(item => item.dialingCode)
        this.countrySelect.push('all')
        this.countrySelectAll = true
      }
      if (this.countrySelectAll && index === -1) {
        this.countrySelect = []
        this.countrySelectAll = false
      }
    },
    selectAllCurency(arr) {
      const index = arr.findIndex(item => item === 'all')
      if (index !== -1 && !this.currencySelectAll) {
        this.currencySelect = this.tokenList.map(item => item.currencyId)
        this.currencySelect.push('all')
        this.currencySelectAll = true
      }
      if (this.currencySelectAll && index === -1) {
        this.currencySelect = []
        this.currencySelectAll = false
      }
    },
    // 活动币种列表
    getTokenList() {
      currencyList()
        .then((response) => {
          if (+response.code === 200) {
            this.tokenList = response.data
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    /** 列表 */
    getList() {
      userDetail(this.queryParams).then(response => {
        this.dataList = response.rows
        this.dataList.forEach((item) => {
          item.joinTotalQuota = item.joinTotalQuota ? item.joinTotalQuota : '-'
        })
        this.total = response.total
        this.loading = false
      }).catch((err) => {
        this.loading = false
        console.log(err)
      })
    },
    // 详情跳转
    toUserInfo(row) {
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('userId', row.userId)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 格式化请求参数
    formatParams() {
      if (!this.queryParams.activityId) {
        this.queryParams.activityId = undefined
      }
      if (!this.queryParams.uid) {
        this.queryParams.uid = undefined
      }
      if (+this.countrySelect.length === 0) {
        this.queryParams.countrys = undefined
      } else {
        this.queryParams.countrys = this.countrySelect.join(',')
      }
      if (+this.currencySelect.length === 0) {
        this.queryParams.currencyId = undefined
      } else {
        this.queryParams.currencyId = this.currencySelect.join(',')
      }
      if (!this.queryParams.type) {
        this.queryParams.type = undefined
      }
      if (!this.queryParams.islock) {
        this.queryParams.islock = undefined
      }
      if (this.time && this.time[0]) {
        this.queryParams.createTime = new Date(this.time && this.time[0]).getTime()
      } else {
        this.queryParams.createTime = undefined
      }
      if (this.time && this.time[1]) {
        this.queryParams.endTime = new Date(this.time && this.time[1]).getTime()
      } else {
        this.queryParams.endTime = undefined
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.formatParams()
      this.getList()
    },
    // 表单重置
    reset() {
      this.dialogForm = {
      }
      this.resetForm('dialogForm')
    },
    /** 导出按钮操作 */
    handleExport() {
      const _this = this
      this.formatParams()
      this.$confirm('是否确认导数据？', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return exportPersonal(_this.queryParams)
      })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() { })
    }
    // handleHeaderStyle ({ row, column, rowIndex, columnIndex }) {
    //   let cellStyle1 = 'background:red;'
    //   let cellStyle2 = 'background:green;'
    //   let cellStyle3 = 'background:pink;'
    //   if (columnIndex >= 0 && columnIndex < 9 && rowIndex === 1) {
    //     return cellStyle1
    //   }
    //   if (columnIndex >= 8 && columnIndex < 18 && rowIndex === 1) {
    //     return cellStyle2
    //   }
    //   if (columnIndex >= 18 && rowIndex === 1) {
    //     return cellStyle3
    //   }
    // }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-table .el-table__header-wrapper {
    th:nth-child(-n + 5) {
      background: #496aff;
      color: #fff;
    }
    th:nth-child(n + 6) {
      background: #f3d321;
      color: #fff;
    }
    th:nth-child(n + 14) {
      background: #f6a04d;
      color: #fff;
    }
    th:nth-child(n + 21) {
      background: #00bc7b;
      color: #fff;
    }
  }
}
</style>
