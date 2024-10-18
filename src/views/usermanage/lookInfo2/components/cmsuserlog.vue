<template>
  <div class="app-container">
    <!--table-->
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column prop="time" label="操作时间" width="180px" />
      <el-table-column prop="admin_id" :label="$t('financemanager.operator')" width="180px" />
      <el-table-column label="操作类型" width="250px">
        <template slot-scope="scope">
          <span v-for="(type, index) in types" :key="index">
            <span v-for="(status, index) in statuses" :key="index">
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
                type="danger"
              >{{ status.label }}{{ type.label }}</el-tag>
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="reasons" label="备注信息">
        <template slot-scope="scope">
          <span v-if="scope.row.reasons">{{ scope.row.reasons }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
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
  props: ['msg'],
  data() {
    return {
      queryParams: {
        userId: this.msg,
        pageSize: 10,
        pageNum: 1
      },
      loading: true,
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
          label: '申请更换手机'
        },
        {
          value: '9',
          label: '申请更换邮箱'
        },
        {
          value: '10',
          label: '申请解绑谷歌'
        },
        {
          value: '11',
          label: '修改备注名'
        },
        {
          value: '12',
          label: '审核通过更换手机'
        },
        {
          value: '13',
          label: '审核通过更换邮箱'
        },
        {
          value: '14',
          label: '审核通过解绑谷歌'
        },
        {
          value: '15',
          label: '审核拒绝更换手机'
        },
        {
          value: '16',
          label: '审核拒绝更换邮箱'
        },
        {
          value: '17',
          label: '审核拒绝解绑谷歌'
        }
      ],
      statuses: [
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
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
