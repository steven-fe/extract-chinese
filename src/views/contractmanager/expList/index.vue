<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="98px"
    >
      <el-form-item label="体验金批次" prop="experienceConfigId">
        <el-input
          v-model="queryParams.experienceConfigId"
          placeholder="请输入体验金批次"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="体验金币种" prop="marginCoin">
        <el-select
          v-model="queryParams.marginCoin"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in marQueryList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="领取时间" prop="receiveTime">
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
      <el-form-item label="使用状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择使用状态"
          clearable
          size="mini"
          @change="getList"
        >
          <el-option :label="$t('common.all')" :value="undefined" />
          <el-option label="未使用" :value="1" />
          <el-option label="已使用" :value="2" />
          <el-option label="已过期" :value="3" />
        </el-select>
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

    <el-table v-loading="loading" :data="listData" border>
      <el-table-column label="体验金券ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="uid" />
      <el-table-column
        label="领取时间"
        align="center"
        prop="receiveTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.receiveTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="体验金批次ID"
        align="center"
        prop="experienceConfigId"
      />
      <el-table-column label="体验金币种" align="center" prop="marginCoin" />
      <el-table-column
        label="体验金额"
        align="center"
        prop="experienceAmount"
      />
      <el-table-column label="适用币对" align="center" prop="goodsIds">
        <template slot-scope="scope">
          <span v-if="scope.row.goodsIds">{{ scope.row.goodsIds }}</span>
          <span v-else>全部币对</span>
        </template>
      </el-table-column>
      <el-table-column label="杠杆倍数" align="center" prop="multiples" />
      <el-table-column label="有效期" align="center" prop="effectiveDay" />
      <el-table-column label="领取限制" align="center">
        <template slot-scope="scope">
          <span> -- </span>
        </template>
      </el-table-column>
      <el-table-column
        label="到期时间"
        align="center"
        prop="effectiveTimeEnd"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.effectiveTimeEnd) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1">未使用</span>
          <span v-if="scope.row.status == 2">已使用</span>
          <span v-if="scope.row.status == 3">已过期</span>
        </template>
      </el-table-column>
      <el-table-column label="关联订单" align="center" prop="refId">
        <template slot-scope="scope">
          <span v-if="scope.row.refId == 0">--</span>
          <span v-else>
            <el-link
              type="primary"
              :underline="false"
              @click="toExpOrderList(scope.row.refId)"
            >{{ scope.row.refId }}</el-link>
          </span>
        </template>
      </el-table-column>
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
import { list, exportList } from '@/api/contract/expList'
import { expMarList } from '@/api/contract/expConfig'
export default {
  name: '',
  data() {
    return {
      time: undefined,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 体验金领取明细表格数据
      listData: [],
      marQueryList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        experienceConfigId: undefined,
        uid: undefined,
        exchId: undefined,
        marginCoin: undefined,
        goodsIds: undefined,
        experienceAmount: undefined,
        multiples: undefined,
        effectiveDay: undefined,
        receiveTime: undefined,
        effectiveTimeEnd: undefined,
        status: undefined,
        refId: undefined,
        ctime: undefined,
        mtime: undefined
      }
    }
  },
  created() {
    this.getList()
    this.getExpMarList()
  },
  methods: {
    // 体验金币种
    getExpMarList() {
      this.loading = true
      expMarList().then((response) => {
        if (response.code == 200) {
          const list = response.rows
          list.forEach((element) => {
            const data = { label: element.marginCoin, value: element.marginCoin }
            this.marQueryList.push(data)
          })
          this.marQueryList = [
            { label: this.$t('common.all'), value: undefined },
            ...this.marQueryList
          ]
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 查询体验金领取明细列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = this.time ? this.time[0] : undefined
      this.queryParams.endTime = this.time ? this.time[1] : undefined
      list(this.queryParams).then((response) => {
        this.listData = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    toExpOrderList(refId) {
      this.$router.push({ name: 'ExpOrder', query: { refId: refId }})
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.time = undefined
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有体验金领取明细数据项?', this.$t('common.alert'), {
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
