<template>
  <div class="app-container">
    <el-card class="box-card">
      <h2>{{ uid }} 的 {{ typeStr }} 列表</h2>
    </el-card>

    <!--table-->
    <el-table v-loading="loading" border class="top" col-class-name="button" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" align="center" :index="indexMethod" />
      <el-table-column prop="id" label="用户ID" align="center" width="180" />
      <el-table-column prop="userRealName" label="姓名" align="center" width="180" />
      <el-table-column prop="email" label="邮箱号" align="center" width="180" />
      <el-table-column prop="phone" label="手机号" align="center" width="180" />
      <el-table-column label="BTFBLP身份验证码" align="center" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.authenticationCode">{{ scope.row.authenticationCode }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="注册IP" align="center" width="150" />
      <el-table-column prop="shareCode" label="我的推荐码" align="center" width="180" />
      <el-table-column prop="invitationcode" align="center" label="被邀请码" width="150" />
      <el-table-column prop="status" label="认证级别" align="center" width="150">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in levelOptions" :key="key">
            <span v-if="scope.row.auth_level == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="用户身份" align="center" width="120">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.auth_level == '2' && scope.row.underwriterFlag == '承销商'"
            size="mini"
            type="success"
            @click="changeUser(false,scope.row.id)"
          >承销商</el-button>
          <el-button
            v-if="scope.row.auth_level == '2' && scope.row.underwriterFlag != '承销商'"
            size="mini"
            type="danger"
            @click="changeUser(true,scope.row.id)"
          >普通用户</el-button>
          <span v-if="scope.row.auth_level != '2' && scope.row.underwriterFlag != '承销商'">普通用户</span>
        </template>
      </el-table-column>
      <el-table-column prop="created" align="center" label="注册时间" width="160" />
    </el-table>

    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="load"
      />
    </div>
  </div>
</template>
<script>
import {
  userInviteList
} from '@/api/datastats/ranking'

export default {
  data() {
    return {
      tableData1: [],
      loading: true,
      pageShow: true,
      isTure: true,
      dialogVisible: false,
      title: undefined,
      accounttitle: undefined,
      // 认证级别
      levelOptions: [
        {
          value: '0',
          label: '未认证'
        },
        {
          value: '1',
          label: '初级认证'
        },
        {
          value: '2',
          label: '高级认证'
        }
      ],
      uid: undefined,
      type: undefined,
      tradeDate: undefined,
      currency: undefined,
      pageSize: 10,
      pageNum: 1,
      tableData: [],
      total: 0,
      formLabelWidth: '140px',
      typeStr: undefined
    }
  },
  mounted() {
    this.uid = this.$route.query.uid
    this.type = this.$route.query.type
    this.tradeDate = this.$route.query.tradeDate.substring(0, 10)
    this.currency = this.$route.query.currency
    switch (this.type) {
      case '1':
        this.typeStr = '总邀请人'
        break
      case '2':
        this.typeStr = '直接邀请人'
        break
      case '3':
        this.typeStr = '间接邀请人'
        break
      case '4':
        this.typeStr = '网格合约交易人'
        break

      default:
        break
    }
    this.load()
  },

  methods: {
    // 加载
    load() {
      this.loading = true
      const formData = {
        uid: this.uid,
        type: this.type,
        tradeDate: this.tradeDate,
        currency: this.currency,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }

      userInviteList(formData)
        .then((response) => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 索引值
    indexMethod(index) {
      return index + (this.pageNum - 1) * this.pageSize + 1
    },
    // 日期处理
    formatDate(time) {
      if (time) {
        const date = new Date(time)
        const year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        if (month < 10) {
          month = '0' + month
        }
        if (day < 10) {
          day = '0' + day
        }
        return year + '-' + month + '-' + day
      } else {
        return ''
      }
    }
  }
}
</script>

