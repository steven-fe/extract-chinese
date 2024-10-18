<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="like" placeholder="模糊查询" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="status" clearable placeholder="请选择状态">
            <el-option
              v-for="item in optionsStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="type" clearable placeholder="请选择类型">
            <el-option key="1" label="买入" value="1" />
            <el-option key="2" label="卖出" value="2" />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="userRealName" label="真实性名" width="120" />
      <el-table-column prop="userPhone" label="手机号" width="150" />
      <el-table-column prop="userId" label="用户ID" />
      <el-table-column prop="t1" label="t1" />
      <el-table-column prop="t2" label="t2" />
      <el-table-column prop="symbol" label="交易对" />
      <el-table-column prop="amount" label="数量" />
      <el-table-column prop="finishAmount" label="成交数量" />
      <el-table-column prop="lockReleasedAmount" label="释放数量" />

      <el-table-column prop="status" :label="$t('common.status')" :formatter="currencyType" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="createTime" label="创建时间" />
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
import { listBbOrder } from '@/api/otc'

export default {
  data() {
    return {
      dialogFormVisible: false,
      form: {
        failReason: '',
        id: ''
      },
      loading: true,
      pageShow: true,
      // 币种下拉
      optionsStatus: [
        {
          value: '0',
          label: '未成交'
        },
        {
          value: '1',
          label: '已成交'
        },
        {
          value: '2',
          label: '部分成交'
        },
        {
          value: '3',
          label: '已撤单（未成交）'
        },
        {
          value: '4',
          label: '已撤单（部分成交）'
        }
      ],
      like: '',
      status: '',
      type: '',
      startDate: '',
      endDate: '',
      pageSize: 10,
      radio: '2',
      pageNum: 1,
      tableData: [],
      total: 0,
      formLabelWidth: '140px'
    }
  },
  created() {
    this.load()
  },
  methods: {
    currencyType(row, column, cellValue) {
      for (let i = 0; i < this.optionsStatus.length; i++) {
        if (this.optionsStatus[i].value == cellValue) {
          return this.optionsStatus[i].label
        }
      }
    },
    handleEdit(row, index) {
      this.form.id = index.id
      this.dialogFormVisible = true
    },
    // 加载
    load() {
      this.loading = true
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        like: this.like,
        type: this.type,
        status: this.status
      }
      listBbOrder(formData)
        .then(response => {
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
        .catch(error => {
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
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
