<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="120px">
      <el-form-item label="活动名称:" placeholder="活动名称">
        <el-input v-model="form.activityName" clearable />
      </el-form-item>
      <el-form-item label="活动id" placeholder="活动id">
        <el-input v-model="form.activityId" clearable />
      </el-form-item>
      <el-form-item label="活动时间范围:">
        <el-date-picker
          v-model="value1"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          @change="pickerChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="getConfigList(true)"
        >查找</el-button>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="exportExcel"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      class="table cabin-table"
    >
      <el-table-column
        prop="activityId"
        label="活动id"
        align="center"
      />
      <el-table-column
        prop="activityName"
        label="活动名称"
        align="center"
      />
      <el-table-column label="活动开始时间" align="center" width="180">
        <template slot-scope="scope" type="form">{{
          scope.row.startTime | timeFilter
        }}</template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" width="180">
        <template slot-scope="scope">{{
          scope.row.endTime | timeFilter
        }}</template>
      </el-table-column>
      <el-table-column prop="kycReceiveNumber" label="任务类型" align="center">
        <template slot-scope="scope">{{
          scope.row.taskType | computedtaskType
        }}</template>
      </el-table-column>
      <el-table-column
        prop="summer"
        label="完成人数"
        align="center"
      />
      <el-table-column
        prop="rewardUsed"
        label="奖励领取人数"
        align="center"
      />
      <el-table-column label="奖励剩余份数" align="center">
        <template slot-scope="scope">{{
          scope.row.rewardTotal - scope.row.rewardUsed
        }}</template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import {
  getActivityCensusList,
  getActivityCensusListExcel
} from '@/api/operate/pullNewActivityCensus'
import { date, time } from '@/utils/format'

export default {
  name: 'ActivityCensusList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    },
    computedtaskType(val) {
      const obj = {
        1: '注册',
        2: '邀请注册',
        3: '邀请kyc',
        4: 'kyc',
        5: '充值'
      }
      return obj[val]
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return (
              time.getTime() <
              new Date(new Date().toLocaleDateString()).getTime()
            )
          }
          return true
        }
      },

      total: 0,
      value1: '',
      form: {
        activityName: undefined,
        beginTs: '',
        endTs: '',
        activityId: undefined,
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: []
    }
  },

  mounted() {
    this.getConfigList()
  },
  methods: {
    pickerChange(val) {
      if (val) {
        this.form.beginTs = val[0].getTime()
        this.form.endTs = val[1].getTime()
        return
      }
      this.form.beginTs = ''
      this.form.endTs = ''
    },
    // 导出excel
    exportExcel() {
      getActivityCensusListExcel({
        activityId: this.form.activityId || undefined,
        beginTs: this.form.beginTs || undefined,
        endTs: this.form.endTs || undefined,
        activityName: this.form.activityName || undefined
      }).then((res) => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: '导出成功'
          })
        } else {
          this.$message.error('导出失败')
        }
      })
    },

    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      getActivityCensusList(this.form).then((response) => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
</style>
