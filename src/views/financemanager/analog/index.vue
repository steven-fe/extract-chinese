<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="UID" prop="uid">
        <el-input
          v-model="form.userId"
          placeholder="UID"
          size="mini"
          clearable
        />
      </el-form-item>
      <el-form-item label="发放时间" prop="time">
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
      <el-button
        type="primary"
        icon="el-icon-search"
        size="mini"
        @click="handleQuery"
      >{{$t('common.search')}}</el-button>
      <el-button type="primary" size="mini" @click="getExport()">
        {{$t('common.derive')}}
      </el-button>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column prop="userId" label="UID" align="center" />
      <el-table-column prop="businessId" label="业务id" align="center" />
      <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
      <el-table-column prop="currencyId" label="币种id" align="center" />
      <el-table-column prop="amountStr" label="金额" align="center" />
      <el-table-column label="领取状态" align="center">
        <template slot-scope="scope">{{ typeLabel(statusOptions, scope.row.status) }}</template>
      </el-table-column>
      <el-table-column label="领取时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.createTime | timeFilter }}</template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNo"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import { getList, listExport } from '@/api/operate/analog'
import { commonFilter } from '@/utils/filters'
import { formatDate } from '@/utils'

export default {
  filters: {
    timeFilter(val) {
      return formatDate(val)
    }
  },
  data() {
    return {
      total: 0,
      time: '',
      form: {
        userId: undefined,
        startTime: '',
        endTime: '',
        pageNo: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      statusOptions: [
        { label: '成功', value: 1 },
        { label: '失败', value: 2 }
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
      this.form.pageNo = 1
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
        this.pageNo = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNo = 1
      }
      if (this.time) {
        this.form.startTime = this.time[0]
        this.form.endTime = this.time[1]
      }
      getList(this.form).then(response => {
        if (response.code == 200) {
          const data = response.data
          this.tableData = data.list
          this.total = data.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getExport() {
      listExport().then(res => {
        return res
      }).then(res => {
        this.download(res.msg)
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
