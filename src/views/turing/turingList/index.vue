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
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="userRealName" label="真实性名" width="120" />
      <el-table-column prop="userPhone" label="手机号" width="150" />
      <el-table-column prop="userId" label="用户ID" />
      <el-table-column prop="amount" label="数量" />
      <el-table-column prop="resultAmount" label="得到币种数量" />
      <el-table-column prop="currency" label="兑换币种" />
      <el-table-column prop="status" :label="$t('common.status')" :formatter="currencyType" />
      <el-table-column prop="address" label="提现地址" />
      <el-table-column prop="cashTime" label="创建时间" />
      <el-table-column prop="dealTime" label="处理时间" />
      <el-table-column :label="$t('common.operation')" width="160">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status == 1"
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >审核</el-button>
          <el-button size="mini" @click="handleEdits(scope.$index, scope.row)">查看</el-button>
        </template>
      </el-table-column>
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
    <el-dialog title="兑换审核" :visible.sync="dialogFormVisible">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item label="审核" :label-width="formLabelWidth">
          <el-radio v-model="radio" label="2">同意</el-radio>
          <el-radio v-model="radio" label="3">拒绝</el-radio>
        </el-form-item>
        <el-form-item v-if="radio == 3" label="理由" :label-width="formLabelWidth">
          <el-input v-model="form.failReason" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCash, updateCash } from '@/api/turing'

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
      optionsStatus: [
        {
          value: '1',
          label: '待审核'
        },
        {
          value: '2',
          label: '已兑现'
        },
        {
          value: '3',
          label: '拒绝'
        }
      ],
      like: '',
      status: '1',
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
    handleEdit(row, index) {
      this.form.id = index.id
      this.dialogFormVisible = true
    },
    handleEdits(row, index) {
      this.$router.push({ name: 'lookInfo', params: { id: index.userId }})
    },
    handleEditTure() {
      if (this.radio == 2) {
        const data = {
          id: this.form.id,
          status: this.radio
        }
        updateCash(data)
          .then(response => {
            this.$message({
              showClose: true,
              message: '审核成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.load()
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        if (this.form.failReason.length == 0) {
          this.$message({
            showClose: true,
            message: '请填写全部信息',
            type: 'error'
          })
          return
        }
        const data = {
          id: this.form.id,
          status: this.radio,
          extra: this.form.failReason
        }
        updateCash(data)
          .then(response => {
            this.$message({
              showClose: true,
              message: '拒绝成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.load()
          })
          .catch(error => {
            console.log(error)
          })
      }
    },
    time(row, column, cellValue) {
      var d = new Date(cellValue)
      return (
        d.getFullYear() +
        '-' +
        (d.getMonth() + 1) +
        '-' +
        d.getDate() +
        ' ' +
        d.getHours() +
        ':' +
        d.getMinutes()
      )
    },
    currencyType(row, column, cellValue) {
      for (let i = 0; i < this.optionsStatus.length; i++) {
        if (this.optionsStatus[i].value == cellValue) {
          return this.optionsStatus[i].label
        }
      }
    },
    // 加载
    load() {
      this.loading = true
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        like: this.like,
        status: this.status,
        startTime: this.formatDate(this.startDate),
        endTime: this.formatDate(this.endDate)
      }
      listCash(formData)
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
