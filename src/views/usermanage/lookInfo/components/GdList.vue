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
            <el-option key="卖出" label="卖出" value="卖出" />
            <el-option key="买入" label="买入" value="买入" />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="currency" clearable placeholder="请选择币种">
            <el-option
              v-for="item in coinOptions"
              :key="item.currency"
              :label="item.currency"
              :value="item.currency"
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
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="单笔限额下限">
              <span>{{ props.row.min_limit }}</span>
            </el-form-item>
            <el-form-item label="单笔限额上限">
              <span>{{ props.row.max_limit }}</span>
            </el-form-item>
            <el-form-item label="挂单总金额">
              <span>{{ props.row.total_price }}</span>
            </el-form-item>
            <el-form-item label="可交易金额">
              <span>{{ props.row.tradable_money }}</span>
            </el-form-item>
            <el-form-item label="成交金额">
              <span>{{ props.row.traded_money }}</span>
            </el-form-item>
            <el-form-item label="委托时间">
              <span>{{ props.row.entrust_time }}</span>
            </el-form-item>
            <el-form-item label="支付方式">
              <span>{{ props.row.payMethod }}</span>
            </el-form-item>
            <el-form-item :label="$t('common.remarks')">
              <span>{{ props.row.extral }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column type="index" :index="indexMethod" />
      <el-table-column prop="id" label="挂单ID" />
      <el-table-column prop="entruster_id" label="委托人ID" />
      <el-table-column prop="entruster_name" label="委托人姓名" />
      <el-table-column prop="type" label="挂单类型" />
      <el-table-column prop="status" label="挂单状态" />
      <el-table-column prop="currency" label="委托币种" />
      <el-table-column prop="price" label="委托价格" />
      <el-table-column prop="count" label="委托数量" />
      <el-table-column prop="tradable_count" label="可交易数量" />
      <el-table-column prop="trading" label="成交数量" />
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
    <el-dialog title="查看图片" :visible.sync="dialogFormVisible1">
      <img style="display: block;margin: 0 auto" :src="imgSrc" alt>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible1 = false">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listEntryOrders, listCtcOtcPrice } from '@/api/otc'

export default {
  props: ['msg', 'cur'],

  data() {
    return {
      dialogFormVisible1: false,
      imgSrc: '',
      loading: true,
      pageShow: true,
      userId: this.msg,
      currency: this.cur || '',
      type: '',
      // 日期快捷选项
      // 币种下拉
      optionsStatus: [
        {
          value: 'finish',
          label: '非不可交易'
        },
        {
          value: '可交易',
          label: '可交易'
        },
        {
          value: '正在交易',
          label: '正在交易'
        },
        {
          value: '不可交易',
          label: '不可交易'
        },
        {
          value: '隐藏',
          label: '隐藏'
        }
      ],
      like: '',
      status: '',
      startDate: '',
      endDate: '',
      pageSize: 10,
      radio: '2',
      pageNum: 1,
      tableData: [],
      total: 0,
      formLabelWidth: '140px',
      coinOptions: []
    }
  },
  created() {
    this.getCtcOtcCoinList()
    this.load()
  },
  methods: {
    getCtcOtcCoinList() {
      const data = {}
      listCtcOtcPrice(data)
        .then(response => {
          if (response.code == 200 && response.rows) {
            this.coinOptions = response.rows
          } else {
            this.coinOptions = []
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 加载
    imgSrcShow(src) {
      this.dialogFormVisible1 = true
      this.imgSrc = src
    },
    load() {
      this.loading = true
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        like: this.like,
        type: this.type,
        status: this.status,
        userId: this.userId,
        currency: this.currency
      }
      listEntryOrders(formData)
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
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
