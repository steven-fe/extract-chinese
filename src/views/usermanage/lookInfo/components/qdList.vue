<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="like " placeholder="模糊查询" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-date-picker
            v-model="startDate"
            align="right"
            type="date"
            placeholder="选择开始日期"
            :picker-options="pickerOptions"
          />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-date-picker
            v-model="endDate"
            align="right"
            type="date"
            placeholder="选择结束日期"
            :picker-options="pickerOptions"
          />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" icon="el-icon-search" @click="load()">{{$t('common.search')}}</el-button>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div style="line-height: 36px;" class="grid-content bg-purple">
          <span>{{ '累计获得:' + sum + 'TUR' }}</span>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="index" :index="indexMethod" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="userRealName" label="真实姓名" />

      <el-table-column prop="userPhone" label="手机号" />
      <el-table-column prop="reward" label="奖励" />
      <el-table-column prop="checkin_time" label="创建时间" />
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
import { listCheckin } from '@/api/coin'

export default {
  props: ['msg'],
  data() {
    return {
      userId: this.msg,
      sum: '',
      tableData1: [],
      loading: true,
      pageShow: true,
      isTure: true,
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
      like: '',
      startDate: '',
      endDate: '',
      pageSize: 10,
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
    // 加载
    load() {
      this.loading = true
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        like: this.like,
        userId: this.userId,
        startTime: this.formatDate(this.startDate),
        endTime: this.formatDate(this.endDate)
      }

      listCheckin(formData)
        .then(response => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.sum = response.data
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.sum = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 改变每页显示条数
    userStatu(row, column, cellValue) {
      for (let i = 0; i < this.optionsStatus.length; i++) {
        if (this.optionsStatus[i].value == cellValue) {
          return this.optionsStatus[i].label
        }
      }
    },
    authenticateT(row, column, cellValue) {
      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].value == cellValue) {
          return this.options[i].label
        }
      }
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
