<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="realName" placeholder="请输入用户ID" />
        </div>
      </el-col>

      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="currency" clearable placeholder="请选择币种">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="status" clearable placeholder="请选择状态">
            <el-option
              v-for="item in option"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
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
      <el-table-column prop="user_id" label="用户ID" />
      <el-table-column prop="value" label="转账数" />
      <el-table-column prop="platform" label="平台" />
      <el-table-column prop="currency" :label="$t('common.coin')" />
      <el-table-column prop="hash" label="转账hash" />
      <el-table-column prop="from_address" label="付款地址" />
      <el-table-column prop="to_address" label="收款地址" />
      <el-table-column prop="status" :label="$t('common.status')" :formatter="currencyType" />
      <el-table-column prop="recharge_time" label="创建时间" />
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
import { listRecharge } from '@/api/wallet'

export default {
  data() {
    return {
      loading: true,
      pageShow: true,
      // 日期快捷选项
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date())
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          },
          {
            text: '一周前',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }
        ]
      },
      // 币种下拉
      options: [
        {
          value: 'USDT',
          label: 'USDT'
        },
        {
          value: 'ETH',
          label: 'ETH'
        }
      ],
      option: [
        {
          value: '0',
          label: '未处理'
        },
        {
          value: '1',
          label: '已处理'
        },
        {
          value: '2',
          label: '正在转出'
        }
      ],
      realName: '',
      currency: '',
      status: '',
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
    // 币种切换
    currencyType(row, column, cellValue) {
      for (let i = 0; i < this.option.length; i++) {
        if (this.option[i].value == cellValue) {
          return this.option[i].label
        }
      }
    },
    // 加载
    load() {
      this.loading = true
      const formData = {
        currency: this.currency,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        status: this.status,
        userId: this.realName
      }
      listRecharge(formData)
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
