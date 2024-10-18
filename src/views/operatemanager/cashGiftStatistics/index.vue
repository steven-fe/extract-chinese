<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="统计时间" prop="time">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          style="width: 200px"
          type="datetime"
          placeholder="统计时间"
          value-format="yyyy-MM-dd"
          @change="timeChange"
        />
      </el-form-item>
      <el-button
        type="primary"
        icon="el-icon-search"
        size="mini"
        @click="handleQuery"
      >{{$t('common.search')}}</el-button>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column prop="cTimeStr" label="日期" align="center" />
      <el-table-column prop="missionStartNumber" label="领取任务人数" align="center" />
      <el-table-column prop="missionCompleteNumber" label="完成任务人数" align="center" />
      <el-table-column prop="depositAmountStr" label="充值金额" align="center" />
      <el-table-column prop="inviteVolumeStr" label="当日用户累计交易量" align="center" />
      <el-table-column prop="friendInviteVolumeStr" label="当日用户好友累计交易量" align="center" />
      <el-table-column prop="inviteNumber" label="邀请人数" align="center" />
      <el-table-column prop="couponNumber" label="福利券领取人数" align="center" />
      <el-table-column prop="bonusNumber" label="赠金领取人数" align="center" />
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
import { getStatisticsList } from '@/api/operate/cashGift'
import { date, time } from '@/utils/format'
import { commonFilter } from '@/utils/filters'

export default {
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
      total: 0,
      time: null,
      form: {
        time: null,
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}]
    }
  },
  computed: {
  },

  mounted() {
    this.getConfigList()
  },
  methods: {
    handleQuery() {
      this.form.pageNum = 1
      this.getConfigList()
    },
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 日期改变事件
    timeChange(val) {
      if (val) {
        this.form.time = val
        return
      }
      this.form.time = undefined
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
      getStatisticsList(this.form).then(response => {
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
</style>
