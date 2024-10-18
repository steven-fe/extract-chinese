<template>
  <div class="app-container">
    <template>
      <el-table
        :data="tableData"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          v-for="column in tabColumns"
          :key="column.label"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :show-overflow-tooltip="true"
        />
        <el-table-column prop="操作">
          <template
            v-if="scope.row.bindStatus==='已绑定'"
            slot-scope="scope"
          >
            <el-button
              size="mini"
              type="primary"
              @click="resetHandle(scope.row)"
            >重置GA</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getBindDetailsList"
      />
    </template>
  </div>
</template>

<script>
import {
  getBindDetailsList,
  unbindByUser
} from '@/api/userSecurity/userSecurity.js'
export default {
  data() {
    return {
      // 表头
      tabColumns: [
        {
          label: '用户编号',
          prop: 'userId',
          width: '80'
        },
        {
          label: '用户名称',
          prop: 'userName',
          width: ''
        },
        {
          label: '用户昵称',
          prop: 'nickName',
          width: ''
        },
        {
          label: '角色',
          prop: 'roleName',
          width: ''
        },
        {
          label: 'GA绑定状态',
          prop: 'bindStatus',
          width: ''
        },
        {
          label: '用户创建时间',
          prop: 'createTime',
          width: ''
        },
        {
          label: 'GA绑定时间',
          prop: 'googleBindTime',
          width: ''
        },
        {
          label: 'GA解绑时间',
          prop: 'googleUnbindTime',
          width: ''
        },
        {
          label: '最后登录时间',
          prop: 'loginLastTime',
          width: ''
        }
      ],
      // 表格列表
      tableData: [],
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  mounted() {
    this.getBindDetailsList()
  },
  methods: {
    getBindDetailsList() {
      getBindDetailsList(this.queryParams).then(res => {
        this.total = res.total
        res.rows.forEach(element => {
          element.googleBindTime = element.googleBindTime
            ? this.parseTime(element.googleBindTime, '{y}-{m}-{d} {h}:{i}:{s}')
            : ''
          element.createTime = element.createTime
            ? this.parseTime(element.createTime, '{y}-{m}-{d} {h}:{i}:{s}')
            : ''
          element.loginLastTime = element.loginLastTime
            ? this.parseTime(element.loginLastTime, '{y}-{m}-{d} {h}:{i}:{s}')
            : ''
          element.googleUnbindTime = element.googleUnbindTime
            ? this.parseTime(
              element.googleUnbindTime,
              '{y}-{m}-{d} {h}:{i}:{s}'
            )
            : ''
          element.bindStatus = element.bindStatus === 1 ? '已绑定' : '未绑定'
        })
        this.tableData = res.rows
      })
    },
    resetHandle(row) {
      const params = { userId: row.userId }
      this.$confirm('确定重置?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          unbindByUser(params).then(res => {
            this.$message({
              type: 'success',
              message: '重置成功!'
            })
            this.getBindDetailsList()
            this.$store.dispatch('GetBinGa')
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消重置'
          })
        })
    },
    parseTime(time, cFormat) {
      if (arguments.length === 0) {
        return null
      }
      const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
      let date
      if (typeof time === 'object') {
        date = time
      } else {
        if (('' + time).length === 10) time = parseInt(time, 10) * 1000
        date = new Date(time)
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
      }
      return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') {
          return ['日', '一', '二', '三', '四', '五', '六'][value]
        }
        if (result.length > 0 && value < 10) {
          value = '0' + value
        }
        return value || 0
      })
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style>
</style>
