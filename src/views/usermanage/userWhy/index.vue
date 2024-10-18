<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" label-width="70px">
      <el-form-item label="用户Id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户Id"
          clearable
          size="mini"
          @keyup.enter.native="load"
        />
      </el-form-item>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="load">{{$t('common.search')}}</el-button>
    </el-form>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" align="center" :index="indexMethod" />
      <el-table-column :label="$t('dwmanager.userUID')">
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
      <el-table-column prop="userName" align="center" label="用户名" />
      <el-table-column prop="reasons" align="center" label="原因" />
      <el-table-column :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <span v-for="(type, index) in types" :key="index">
            <span v-for="(status, index) in statuses" :key="index">
              <!-- <el-tag
                type="danger"
                v-if="scope.row.status==''&&scope.row.type==type.value && scope.row.status==status.value"
              >{{type.label}}{{status.label}}</el-tag> -->
              <el-tag
                v-if="scope.row.status=='0'&&scope.row.type==type.value && scope.row.status==status.value"
                type="danger"
              >{{ type.label }}{{ status.label }}</el-tag>
              <el-tag
                v-if="scope.row.status=='1'&&scope.row.type==type.value && scope.row.status==status.value"
                type="success"
              >{{ type.label }}{{ status.label }}</el-tag>
              <el-tag
                v-if="scope.row.status=='99'&&scope.row.type==type.value && scope.row.status==status.value"
                type="success"
              >{{ status.label }}{{ type.label }}</el-tag>
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="admin_id" align="center" label="管理员ID" />
      <el-table-column prop="time" align="center" label="时间" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="load"
      />
    </div>
  </div>
</template>

<script>
import { listUserFrozenReasons } from '@/api/user'

export default {
  data() {
    return {
      queryParams: {
        userId: undefined,
        pageSize: 10,
        pageNum: 1
      },
      loading: true,
      pageShow: true,
      tableData: [],
      total: 0,
      types: [
        {
          value: '1',
          label: '登录'
        },
        {
          value: '2',
          label: '提现'
        },
        {
          value: '4',
          label: 'OTC交易'
        },
        {
          value: '5',
          label: '合约交易'
        },
        {
          value: '6',
          label: '返佣'
        },
        {
          value: '7',
          label: '期权'
        },
        {
          value: '8',
          label: '更换手机'
        },
        {
          value: '9',
          label: '更换邮箱'
        },
        {
          value: '10',
          label: '解绑谷歌'
        },
        {
          value: '20',
          label: '绑定手机号'
        },
        {
          value: '21',
          label: '绑定邮箱'
        },
        {
          value: '22',
          label: '解绑手机号'
        },
        {
          value: '23',
          label: '解绑邮箱'
        }
      ],
      statuses: [
        { value: '', label: '' },
        { value: '0', label: '冻结' },
        {
          value: '1',
          label: '解冻'
        },
        {
          value: '99',
          label: '后台'
        }
      ]
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      listUserFrozenReasons(this.queryParams)
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
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('userId', row.user_id)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 索引值
    indexMethod(index) {
      return (
        index + (this.queryParams.pageNum - 1) * this.queryParams.pageSize + 1
      )
    }
    // 日期处理
  }
}
</script>
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
