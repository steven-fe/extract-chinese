<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="活动名称:" placeholder="活动名称">
        <el-input v-model="form.names" clearable />
      </el-form-item>
      <el-form-item label="活动id:" placeholder="活动名称">
        <el-input v-model="form.id" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">查找</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="activityId" label="序号" align="center" />
      <el-table-column prop="activityName" label="活动名称" align="center" />
      <el-table-column label="活动开始时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.activityStartTime }}</template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.activityEndTime }}</template>
      </el-table-column>
      <el-table-column prop="rewardCurrency" label="奖励币种" align="center" />
      <el-table-column prop="totalReward" label="总发放奖励" align="center" />
      <el-table-column prop="totalRegister" label="活动总注册人数" align="center" />
      <el-table-column prop="totalKyc" label="活动总实名人数" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import { statisticsList } from '@/api/operate/activity'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapState } from 'vuex'

export default {
  name: 'StatisticsList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      total: 0,
      configId: '',
      updateId: '',
      form: {
        id: '',
        names: '',
        startTime: '',
        endTime: '',
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      open: false
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },

  mounted() {
    this.getConfigList()
  },
  methods: {

    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 日期改变事件
    timeChange(val) {
      if (val) {
        this.form.startTime = val[0]
        this.form.endTime = val[0]
        return
      }
      this.form.startTime = ''
      this.form.endTime = ''
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
      statisticsList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
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
