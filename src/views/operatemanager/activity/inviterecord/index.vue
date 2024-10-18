<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="活动名称:" placeholder="请输入活动名称">
        <el-input v-model="form.activityName" clearable />
      </el-form-item>
      <el-form-item label="起始时间：">
        <el-date-picker
          v-model="date"
          type="datetime"
          :start-placeholder="$t('common.startTime')"
          align="right"
          value-format="timestamp"
          @change="timeChange1"
        />
      </el-form-item>
      <el-form-item label="结束时间：">
        <el-date-picker
          v-model="date2"
          type="datetime"
          start-placeholder="结束日期"
          align="right"
          value-format="timestamp"
          @change="timeChange2"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getInviteRecord(true)">{{$t('common.search')}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportData">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="300px" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="toLevelRecord(scope.row)">发放奖励</el-button>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column label="UID" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.uid">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.uid }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="mobileAndEmail" width="120" label="邮箱/手机" align="center" />
      <el-table-column prop="level1RegisterNumber" label="level1注册人数" align="center" />
      <el-table-column prop="level1KycNumber" label="level1实名人数" align="center" />
      <el-table-column prop="level2RegisterNumber" label="level2注册人数" align="center" />
      <el-table-column prop="level2KycNumber" label="level2实名人数" align="center" />

      <el-table-column prop="level1RegisterIngNumber" label="lvl1注册奖励发放中" align="center" />
      <el-table-column prop="level1RegisterEndNumber" label="lvl1注册奖励已发放" align="center" />
      <el-table-column prop="level1KycIngNumber" label="lvl1实名奖励发放中" align="center" />
      <el-table-column prop="level1KycEndNumber" label="lvl1实名奖励已发放" align="center" />

      <el-table-column prop="level2RegisterIngNumber" label="lvl2注册奖励发放中" align="center" />
      <el-table-column prop="level2RegisterEndNumber" label="lvl2注册奖励已发放" align="center" />
      <el-table-column prop="level2KycIngNumber" label="lvl2实名奖励发放中" align="center" />
      <el-table-column prop="level2KycEndNumber" label="lvl2实名奖励已发放" align="center" />

      <el-table-column prop="invitationUId" width="180" label="邀请人ID" align="center" />
      <el-table-column prop="issuedReward" label=" 已发放奖励" align="center" />
      <el-table-column prop="shouldReward" label="应得奖励" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getInviteRecord"
      />
    </div>
  </div>
</template>
<script>
import * as API from '@/api/operate/activity'
export default {
  name: 'ActivityInviteRecord',
  data() {
    return {
      pageShow: true,
      total: 0,
      form: {
        pageNum: 1,
        pageSize: 10,
        activityName: '',
        orderByColumn: 'id',
        isAsc: 'desc'
      },
      tableData: [],
      open: false,
      date: '',
      date2: ''
    }
  },
  computed: {
  },
  mounted() {
    this.getInviteRecord()
  },
  methods: {
    // 导出
    exportData() {
      API.exportData(this.form).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: '导出成功'
          })
        }
      })
    },
    getInviteRecord() {
      API.inviteRrecord(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 开始日期改变事件
    timeChange1(val) {
      if (val) {
        this.form.sTime = val
        return
      }
      this.form.sTime = ''
    },
    // 结束日期改变事件
    timeChange2(val) {
      if (val) {
        this.form.eTime = val
        return
      }
      this.form.eTime = ''
    },
    // 详情跳转
    toLevelRecord(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('mobileAndEmail', row.mobileAndEmail)
      this.$router.push({ name: 'levelrecord' })
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('userId', row.userId)
      this.$router.push({ name: 'lookInfo2' })
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
