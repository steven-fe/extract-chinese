
<template>
  <div class="pactfund-container">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item :label="$t('userManager.currency')" prop="currencyId">
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
      <el-form-item :label="$t('userManager.fundType')" prop="transferType">
        <el-select
          v-model="queryParams.transferType"
          size="mini"
          filterable
          clearable
        >
          <el-option value="" :label="$t('userManager.all')" />
          <el-option
            v-for="(item,index) in recordTypeOptions"
            :key="index"
            :label="item.desc"
            :value="+item.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.takeTime')">
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
          @click="queryData"
        > {{ $t('userManager.search') }} </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column prop="occureTime" :label="$t('userManager.takeTime')">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.occureTime / 1000) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="currencyName" :label="$t('userManager.currency')" />
      <el-table-column prop="flowTypeName" :label="$t('userManager.fundType')" />
      <el-table-column prop="num" :label="$t('userManager.price')" />
      <el-table-column prop="balance" :label="$t('userManager.changePrice')" />
    </el-table>
    <div class="block top" style="margin-top: 20px;">
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
import { mapState } from 'vuex'
import { getRecordTypeList, getPactRecordList } from '@/api/user'
import dayjs from 'dayjs'
import FlowPage from '@/components/FlowPage'
export default {
  name: 'PactFund',
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
      recordTypeOptions: [],
      queryParams: {
        userId: this.msg,
        id: null, // 下一页标识id
        pageSize: this.pageSize,
        currencyId: '',
        transferType: '',
        beginTime: '',
        endTime: '',
        time: []
      },
      pageSize: 20,
      loading: false,
      tableData: [],
      total: 0,
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
  async created() {
    await this.getRecordTypeList()
    this.getData()
  },
  methods: {
    sizesChange(val) {
      this.pageSize = val
      this.queryData()
    },
    queryData() {
      this.resetPageParams()
      this.getData()
    },
    async getData() {
      try {
        this.loading = true
        if (this.queryParams.time && this.queryParams.time.length > 0) {
          this.queryParams.beginTime = dayjs(this.queryParams.time[0]).valueOf()
          this.queryParams.endTime = dayjs(this.queryParams.time[1]).endOf('day').valueOf()
        } else {
          this.queryParams.beginTime = null
          this.queryParams.endTime = null
        }
        this.queryParams.pageSize = this.pageSize
        const { data } = await getPactRecordList(this.queryParams)
        if (data.length < this.pageSize + 1) {
          this.flowPageParams.isNextPage = false
        }
        if (data && data.length > 0) {
          if (!this.flowPageParams.firstPageId) {
            this.flowPageParams.firstPageId = data[0].flowId
          } else if (data[0].flowId === this.flowPageParams.firstPageId) {
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
    // 获取记录类型
    async getRecordTypeList() {
      try {
        const { data } = await getRecordTypeList('FUTURE')
        this.recordTypeOptions = data
      } catch (error) {
        console.log(error)
      }
    },
    splicePageData(data) {
      this.flowPageParams.lastData = data[data.length - 1]
      let list = data.slice(0, this.pageSize)
      list = list.map(item => {
        const currency = this.currencyList.find(currency => currency.id === item.currencyId)
        const flowType = this.recordTypeOptions.find(op => String(op.code) === String(item.flowType))
        return {
          ...item,
          currencyName: currency && currency.name || '--',
          flowTypeName: flowType && flowType.desc || '--'
        }
      })
      return list
    },
    pageChange(type) {
      if (type === 'next') {
        this.queryParams.side = 1
        this.queryParams.id = this.flowPageParams.lastData.flowId
        this.flowPageParams.isPrevPage = false
      }
      if (type === 'prev') {
        this.queryParams.side = -1
        this.queryParams.id = this.tableData[0].flowId
        this.flowPageParams.isNextPage = true
      }
      this.getData()
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
.pactfund-container {
  padding-bottom: 10px;
}

</style>
