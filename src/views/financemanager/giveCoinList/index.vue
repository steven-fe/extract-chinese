<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">

      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="realName" placeholder="模糊查询" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="currency" clearable placeholder="请选择币种">
            <el-option
              key="USDT"
              label="USDT"
              value="USDT"
            />
            <el-option
              key="TAI"
              label="TAI"
              value="TAI"
            />
            <el-option
              key="TUR"
              label="TUR"
              value="TUR"
            />
            <el-option
              key="HKR"
              label="HKR"
              value="HKR"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
        </div>
      </el-col>
      <!--      <el-col :xs="12" :span="3">-->
      <!--        <div style="line-height: 36px;" class="grid-content bg-purple">-->
      <!--          {{'累计拨币:' + sum}}-->
      <!--        </div>-->
      <!--      </el-col>-->
    </el-row>
    <!--table-->
    <el-table
      v-loading="loading"
      border
      class="top"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        type="index"
        label="序号"
        :index="indexMethod"
      />
      <el-table-column
        prop="userId"
        label="用户ID"
      />
      <el-table-column
        prop="userValue"
        label="用户手机"
      />
      <el-table-column
        prop="currency"
        :label="$t('common.coin')"
      />
      <el-table-column
        prop="amount"
        label="数量"
      />

      <el-table-column
        prop="managerName"
        label="管理员姓名"
      />
      <el-table-column
        prop="managerPhone"
        label="管理员电话"
      />
      <el-table-column
        prop="extral"
        :label="$t('common.remarks')"
      />
      <el-table-column
        prop="gtime"
        label="创建时间"
      />
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
import { listGiveCoin } from '@/api/wallet'

export default {

  data() {
    return {
      currency: '',
      loading: true,
      pageShow: true,
      realName: '',
      pageSize: 10,
      pageNum: 1,
      tableData: [],
      total: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      const formData = {
        'pageNum': this.pageNum,
        'pageSize': this.pageSize,
        'currency': this.currency,
        'like': this.realName
      }
      listGiveCoin(formData).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.tableData = []
          this.total = 0
          this.msgError(response.msg)
        }
        this.loading = false
      }).catch(error => {
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
<style scoped>
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
  }

  .top {
    margin-top: 20px;
  }
</style>
