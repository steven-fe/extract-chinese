<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="UID" prop="uid">
        <el-input
          v-model="form.uid"
          placeholder="UID"
          size="mini"
          clearable
        />
      </el-form-item>
      <el-form-item label="注册时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="认证状态" prop="missionStatus">
        <div class="grid-content bg-purple">
          <el-select v-model="form.missionStatus" :placeholder="$t('common.all')" size="mini" clearable>
            <el-option
              v-for="item in missionStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="赠金领取状态" prop="bonusStatus">
        <div class="grid-content bg-purple">
          <el-select v-model="form.bonusStatus" :placeholder="$t('common.all')" size="mini" clearable>
            <el-option
              v-for="item in bonusStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="福利券兑换状态" prop="couponStatus">
        <div class="grid-content bg-purple">
          <el-select v-model="form.couponStatus" :placeholder="$t('common.all')" size="mini" clearable>
            <el-option
              v-for="item in couponStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
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
      <el-table-column prop="userId" label="UID" align="center" />
      <el-table-column label="邮箱/手机号" align="center" width="180">
        <template slot-scope="scope">
          <div>{{ scope.row.email }}</div>
          <div>{{ scope.row.country + " " + scope.row.phone }}</div>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center">
        <template slot-scope="scope">{{ typeLabel(missionStatusOptions, scope.row.missionStatus) }}</template>
      </el-table-column>
      <el-table-column prop="alreadyGetAmountStr" label="奖励金额" align="center" />
      <el-table-column prop="depositAmountStr" label="用户充值金额" align="center" />
      <el-table-column prop="tradingVolumeStr" label="用户交易量" align="center" />
      <el-table-column prop="inviteNumber" label="邀请好友数" align="center" />
      <el-table-column prop="inviteVolumeStr" label="好友累计交易量" align="center" />
      <el-table-column label="赠金领取状态" align="center">
        <template slot-scope="scope">{{ typeLabel(bonusStatusOptions, scope.row.bonusStatus) }}</template>
      </el-table-column>
      <el-table-column prop="sentBonusAmountStr" label="已发放奖励" align="center" />
      <el-table-column label="兑换状态" align="center">
        <template slot-scope="scope">{{ typeLabel(couponStatusOptions, scope.row.couponStatus) }}</template>
      </el-table-column>
      <el-table-column label="任务开始时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.missionStartTime | timeFilter }}</template>
      </el-table-column>
      <el-table-column label="任务过期时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.missionExpireTime | timeFilter }}</template>
      </el-table-column>
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
import { getList } from '@/api/operate/cashGift'
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
      time: '',
      form: {
        missionStatus: '',
        bonusStatus: '',
        couponStatus: '',
        uid: undefined,
        startTime: '',
        endTime: '',
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      missionStatusOptions: [
        { label: '未领取', value: 1 },
        { label: '分享链接', value: 2 },
        { label: '邀请好友', value: 3 },
        { label: '充值', value: 4 },
        { label: '交易', value: 5 },
        { label: '好友交易', value: 6 },
        { label: '已完成', value: 7 },
        { label: '已失败', value: 8 }
      ],
      bonusStatusOptions: [
        { label: '未领取', value: 1 },
        { label: '已领取', value: 2 }
      ],
      couponStatusOptions: [
        { label: '未兑换', value: 1 },
        { label: '已兑换', value: 2 }
      ]
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
      if (this.time) {
        this.form.startTime = this.time[0]
        this.form.endTime = this.time[1]
      }
      getList(this.form).then(response => {
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
