<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="操作人id" prop="uid">
        <el-input
          v-model="form.uid"
          placeholder=""
          size="mini"
          clearable
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
      <el-table-column prop="createTimeStr" label="操作时间" align="center" />
      <el-table-column prop="userId" label="操作人ID" align="center" />
      <el-table-column prop="pageName" label="导出页面" align="center" />
      <el-table-column label="导出类型" align="center">
        <template slot-scope="scope">{{ typeLabel(sTypeOptions, scope.row.sType) }}</template>
      </el-table-column>
      <el-table-column prop="sCount" label="导出条数" align="center" />
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
import { getExportLogList } from '@/api/system/exportLog'
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
        uid: undefined,
        startTime: '',
        endTime: '',
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      sTypeOptions: [
        { label: '全部导出', value: 1 },
        { label: '分页', value: 2 }
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
      getExportLogList(this.form).then(response => {
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
