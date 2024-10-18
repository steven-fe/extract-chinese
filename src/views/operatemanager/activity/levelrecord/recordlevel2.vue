<template>
  <div class="app-container">
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="300px" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.registerStatus === 1"
            type="info"
            size="mini"
            disabled="disabled"
          >注册奖励已发放</el-button>
          <el-button
            v-if="scope.row.registerStatus === 2"
            type="primary"
            size="mini"
            @click="audit(1, scope.row)"
          >注册奖励</el-button>
          <el-button
            v-if="scope.row.registerStatus === 3"
            type="info"
            size="mini"
            disabled="disabled"
          >注册奖励发放中</el-button>
          <el-button
            v-if="scope.row.kycStatus === 1"
            type="info"
            size="mini"
            disabled="disabled"
          >实名奖励已发放</el-button>
          <el-button
            v-if="scope.row.kycStatus === 2 && scope.row.kycTime == null "
            type="info"
            size="mini"
            disabled="disabled"
            @click="audit(2, scope.row)"
          >实名奖励</el-button>
          <el-button
            v-if="scope.row.kycStatus === 2 && scope.row.kycTime != null "
            type="primary"
            size="mini"
            @click="audit(2, scope.row)"
          >实名奖励</el-button>
          <el-button
            v-if="scope.row.kycStatus === 3"
            type="info"
            size="mini"
            disabled="disabled"
          >实名奖励发放中</el-button>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column label="UID">
        <template slot-scope="scope">
          <span v-if="scope.row.userId">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.userId }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="account" label="账号" align="center" />
      <el-table-column prop="registerTime" label="注册时间" align="center" />
      <el-table-column prop="kycTime" label="实名认证时间" align="center" />
      <el-table-column label="邀请人UID">
        <template slot-scope="scope">
          <span v-if="scope.row.invitationUserId">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo2(scope.row)"
            >{{ scope.row.invitationUserId }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="invitationAccount" label="邀请人账号" align="center" />
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
      UID: '',
      form: {
        pageNum: 1,
        pageSize: 10,
        uid: '',
        level: 2,
        orderByColumn: 'id',
        isAsc: 'desc'
      },
      tableData: [],
      open: false
    }
  },
  computed: {

  },
  mounted() {
    this.UID = sessionStorage.getItem('uid')
    this.form.uid = this.UID
    this.getInviteRecord()
  },
  methods: {
    getInviteRecord() {
      API.inviteLvelRrecord(this.form).then(response => {
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
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    toUserInfo2(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.invitationUserId)
      sessionStorage.setItem('userId', row.invitationId)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 详情跳转
    toLevelRecord(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('mobileAndEmail', row.mobileAndEmail)
      this.$router.push({ name: 'levelrecord' })
    },
    // 审核通过、驳回
    audit(type, row) {
      const params = {
        id: row.id,
        type: type,
        level: this.form.level
      }
      var num = ''
      if (type == 1) {
        num = row.registerRewardNumber + 'USDT注册奖励？'
      } else if (type == 2) {
        num = row.kycRewardNumber + 'USDT实名奖励？'
      }
      var msg = '请确认是否发放给UID:' + row.invitationUserId + ' 用户' + num
      this.$confirm(msg, this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        API.award(params).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '审核成功'
            })
            this.getInviteRecord()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '审核取消'
        })
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
