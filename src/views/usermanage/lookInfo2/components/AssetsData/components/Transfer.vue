<template>
  <div class="transfer-container">
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('userManager.accountTransfer')" name="account" />
      <el-tab-pane v-if="userInfo && userInfo.accountType !== 0" :label="$t('userManager.subAccountTransfer')" :disabled="userInfo && userInfo.accountType === 0" name="subAccount" />
    </el-tabs>
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item :label="$t('userManager.transferCurrency')" prop="currencyId">
        <el-select
          v-model="queryParams.currencyId"
          size="mini"
          filterable
          clearable
        >
          <el-option value="" :label="$t('userManager.all')" />
          <el-option
            v-for="(item,index) in currencyList"
            :key="index"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.transferTime')">
        <el-date-picker
          v-model="queryParams.time"
          clearable
          size="mini"
          type="datetimerange"
          :range-separator="$t('userManager.to')"
          :start-placeholder="$t('userManager.startTime')"
          :end-placeholder="$t('userManager.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label prop="symbol">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          :disabled="activeName === 'subAccount' && userInfo && userInfo.accountType === 0"
          @click="queryData"
        >{{ $t('userManager.search') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column prop="currencyName" :label="$t('userManager.transferCurrency')" />
      <el-table-column prop="fromTypeDesc" :label="$t('userManager.from')" />
      <el-table-column prop="toTypeDesc" :label="$t('userManager.to')" />
      <el-table-column prop="amount" :label="$t('userManager.amount')" />
      <el-table-column prop="time" :label="$t('userManager.transferTime')">
        <template slot-scope="scope">
          {{ parseTime(scope.row.time) }}
        </template>
      </el-table-column>
    </el-table>
    <div class="block top">
      <FlowPage
        :page-size="pageSize"
        :is-prev-page="flowPageParams.isPrevPage"
        :is-next-page="flowPageParams.isNextPage"
        @pageChange="pageChange"
        @sizesChange="sizesChange"
      />
    </div>
  </div>
</template>

<script>
import { getTransferRecord } from '@/api/user'
import { mapState } from 'vuex'
import { userInfo } from '@/api/user'
import FlowPage from '@/components/FlowPage'
import dayjs from 'dayjs'
export default {
  name: 'Transfer',
  components: {
    FlowPage
  },
  props: {
    msg: {
      type: [String, Number],
      default: ''
    },
    userId: {
      type: [String, Number],
      default: ''
    },
    uid: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      activeName: 'account',
      symbolsOptions: [],
      queryParams: {
        userId: this.msg,
        transferType: 0,
        pageSize: 20,
        currencyId: null,
        beginTime: '',
        entTime: '',
        id: null,
        time: []
      },
      loading: false,
      tableData: [],
      total: 0,
      pageSize: 20,
      userInfo: {},
      flowPageParams: {
        isPrevPage: true, // 是否第一页
        isNextPage: true, // 是否有下一页
        queryPageId: null,
        lastData: null, // 最后一条数据
        firstPageId: null // 第一页数据的ID, 用于判断是否第一页
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList'])
  },
  watch: {
    activeName: {
      handler(val) {
        this.tableData = []
        this.resetPageParams()
        if (val === 'account') {
          this.queryParams = {
            userId: this.msg,
            transferType: 0,
            pageSize: this.pageSize,
            currencyId: null,
            beginTime: '',
            entTime: '',
            id: null,
            time: []
          }
          this.getAccountData()
        } else {
          this.queryParams = {
            userId: this.msg,
            transferType: this.userInfo.accountType,
            pageSize: this.pageSize,
            currencyId: null,
            beginTime: '',
            entTime: '',
            id: null,
            time: []
          }
          this.getSubAccountData()
        }
      },
      immediate: true
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    sizesChange(val) {
      this.pageSize = val
      this.queryData()
    },
    async getAccountData() {
      try {
        this.loading = true
        this.queryParams.transferType = 0
        if (this.queryParams.time && this.queryParams.time.length > 0) {
          this.queryParams.beginTime = dayjs(this.queryParams.time[0]).valueOf()
          this.queryParams.endTime = dayjs(this.queryParams.time[1]).endOf('day').valueOf()
        } else {
          this.queryParams.beginTime = null
          this.queryParams.endTime = null
        }
        this.queryParams.pageSize = this.pageSize
        const { data } = await getTransferRecord(this.queryParams)
        if (data.length < this.pageSize + 1) {
          this.flowPageParams.isNextPage = false
        }
        if (data && data.length > 0) {
          if (!this.flowPageParams.firstPageId) {
            this.flowPageParams.firstPageId = data[0].id
          } else if (data[0].id === this.flowPageParams.firstPageId) {
            this.flowPageParams.isPrevPage = true
          }
        }
        this.tableData = this.splicePageData(data)
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    splicePageData(data) {
      this.flowPageParams.lastData = data[data.length - 1]
      return data.slice(0, this.pageSize)
    },
    async getSubAccountData() {
      try {
        this.loading = true
        if (this.userId.accountType === 0) return
        if (this.queryParams.time && this.queryParams.time.length > 0) {
          this.queryParams.beginTime = dayjs(this.queryParams.time[0]).valueOf()
          this.queryParams.endTime = dayjs(this.queryParams.time[1]).endOf('day').valueOf()
        } else {
          this.queryParams.beginTime = null
          this.queryParams.endTime = null
        }
        this.queryParams.pageSize = this.pageSize
        const { data } = await getTransferRecord(this.queryParams)
        if (data.length < this.pageSize + 1) {
          this.flowPageParams.isNextPage = false
        }
        if (data && data.length > 0) {
          if (!this.flowPageParams.firstPageId) {
            this.flowPageParams.firstPageId = data[0].id
          } else if (data[0].id === this.flowPageParams.firstPageId) {
            this.flowPageParams.isPrevPage = true
          }
        }
        this.tableData = this.splicePageData(data)
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    queryData() {
      this.resetPageParams()
      if (this.activeName === 'account') {
        this.getAccountData()
      } else {
        this.getSubAccountData()
      }
    },
    async getUserInfo() {
      try {
        const { data } = await userInfo({ uid: this.msg })
        this.userInfo = data
        // this.queryParams.transferType = data.accountType
      } catch (error) {
        console.log(error)
      }
    },
    pageChange(type) {
      if (type === 'next') {
        this.queryParams.side = 1
        this.queryParams.id = this.flowPageParams.lastData.id
        this.flowPageParams.isPrevPage = false
      }
      if (type === 'prev') {
        this.queryParams.side = -1
        this.queryParams.id = this.tableData[0].id
        this.flowPageParams.isNextPage = true
      }
      if (this.activeName === 'account') {
        this.getAccountData()
      } else {
        this.getSubAccountData()
      }
    },
    resetPageParams() {
      this.flowPageParams = {
        isPrevPage: true,
        isNextPage: true,
        queryPageId: null,
        lastData: null,
        firstPageId: null
      }
      this.queryParams.side = 1
      this.queryParams.id = null
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.transfer-container {
  padding-bottom: 10px;
  >>> .el-tabs__nav-wrap::after {
    background-color: transparent;
  }
  .block {
    margin-top: 20px;
  }
}

</style>
