<template>
  <div style="padding-bottom: 20px">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="API Key">
        <el-input v-model="queryParams.token" size="mini" placeholder="请输入API Key" clearable />
      </el-form-item>
      <el-form-item :label="$t('common.status')">
        <el-select v-model="queryParams.status" size="mini" clearable>
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startDate')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="getList()">查询</el-button>
      </el-form-item>
    </el-form>
    <!--table-->
    <el-table v-loading="loading" border :data="apiList">
      <el-table-column :label="$t('common.remarks')" align="center" min-width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.label === ''">--</span>
          <span v-else>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" align="center" prop="believeIps" min-width="350">
        <template slot-scope="scope">
          <span v-if="scope.row.believeIps === ''">--</span>
          <span v-else>{{ scope.row.believeIps }}</span>
        </template>
      </el-table-column>
      <el-table-column label="API Key" align="center" prop="token" min-width="300" />
      <el-table-column label="创建时间" align="center" min-width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center" prop="status" min-width="200">
        <template slot-scope="scope">
          <span v-for="(item, index) in statusOptions" :key="index">
            <span v-if="scope.row.status === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" min-width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 1" type="danger" size="mini" @click="handleChangeStatus(scope.row, 2)">冻结</el-button>
          <el-button v-if="scope.row.status === 2" type="success" size="mini" @click="handleChangeStatus(scope.row, 1)">启用</el-button>
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
        @pagination="getList"
      />
    </div>
  </div>
</template>
<script>
import { getApiList, changeStatus } from '@/api/apiManagement'
export default {
  name: 'ApiManagement',
  props: ['uid', 'msg'],
  data() {
    return {
      time: '',
      total: 0,
      statusOptions: [
        {
          value: 1,
          label: '生效'
        },
        {
          value: 2,
          label: '冻结失效'
        },
        {
          value: 3,
          label: '删除失效'
        }
      ],
      loading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: this.uid,
        token: '',
        status: '',
        startTime: '',
        endTime: ''
      },
      apiList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 加载
    async getList() {
      try {
        this.loading = true
        this.queryParams.startTime = (this.time && this.time[0]) || ''
        this.queryParams.endTime = (this.time && this.time[1]) || ''
        const { rows, total } = await getApiList(this.queryParams)
        this.apiList = rows
        this.total = total
      } catch (e) {
        console.error(e)
        this.apiList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    handleChangeStatus(row, status) {
      const params = {
        id: row.id,
        status: status
      }
      changeStatus(params).then(res => {
        if (res.code === 200) {
          status === 1 ? this.msgSuccess('启用成功') : this.msgSuccess(this.$t('financemanager.freezingSuccess'))
          // if (status === 1) {
          //   this.msgSuccess('启用成功')
          // }
          // if (status === 2) {
          //   this.msgSuccess(this.$t('financemanager.freezingSuccess'))
          // }
          this.getList()
        }
      })
    }
  }
}
</script>
