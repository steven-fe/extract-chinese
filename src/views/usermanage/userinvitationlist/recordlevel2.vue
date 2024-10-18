<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <el-form-item label="用户账号:" prop="account">
        <el-input v-model="searchForm.account" placeholder="邮箱或手机号" clearable />
      </el-form-item>
      <el-form-item label="注册时间:" prop="timeRange">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="reset">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="exportFile">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column label="UID">
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
      <el-table-column prop="account" label="账号" align="center" />
      <el-table-column prop="created" label="注册时间" align="center" />
      <el-table-column prop="inviterUid" label="邀请人UID" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > searchForm.pageSize"
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="search"
      />
    </div>
  </div>
</template>
<script>
import * as API from '@/api/user'

export default {
  name: 'ActivityInviteRecord',
  data() {
    return {
      pageShow: true,
      total: 0,
      UID: '',
      timeRange: [],
      searchForm: {
        uid: '',
        level: 2,
        account: '',
        startTime: '',
        endTime: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      open: false
    }
  },
  computed: {

  },
  mounted() {
    this.UID = sessionStorage.getItem('uid')
    this.searchForm.uid = this.UID
    this.search()
  },
  methods: {
    search(val) {
      this.searchForm.pageNum = val && val.page ? val.page : 1
      this.searchForm.pageSize = val && val.limit ? val.limit : 10
      this.searchForm.startTime = this.timeRange && this.timeRange.length > 0 ? this.timeRange[0] : ''
      this.searchForm.endTime = this.timeRange && this.timeRange.length > 0 ? this.timeRange[1] : ''
      console.log('searchForm', this.searchForm, this.timeRange, val)
      this.getInviteRecord()
    },
    exportFile() {
      API.inviteLvelRrecordExport(this.searchForm).then(res => {
        if (res.code == 200) {
          this.download(res.msg)
        } else {
          this.msgError(res.msg)
        }
      })
    },
    reset() {
      this.$refs.form.resetFields()
      this.searchForm.startTime = ''
      this.searchForm.endTime = ''
      this.timeRange = []
    },
    getInviteRecord() {
      API.inviteLvelRrecord(this.searchForm).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('userId', row.userId)
      this.$router.push({ name: 'lookInfo2' })
    },
    // toUserInfo2(row) {
    //   // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
    //   sessionStorage.setItem("uid", row.inviterId);
    //   sessionStorage.setItem("userId", row.inviterUserId);
    //   this.$router.push({ name: "lookInfo2" });
    // },
    // 详情跳转
    toLevelRecord(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('UID', row.userId)
      sessionStorage.setItem('mobileAndEmail', row.account)
      this.$router.push({ name: 'userinvitation' })
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
