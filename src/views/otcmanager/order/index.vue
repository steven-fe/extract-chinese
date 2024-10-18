<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="like" placeholder="模糊查询" size="mini" clearable />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="status" size="mini" clearable placeholder="请选择状态">
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
          <el-select v-model="currency" size="mini" clearable placeholder="请选择币种">
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
          <el-button type="primary" icon="el-icon-search" size="mini" @click="load()">{{$t('common.search')}}</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="订单ID">
              <span>{{ props.row.entry_order_id }}</span>
            </el-form-item>
            <el-form-item label="卖家ID">
              <span>{{ props.row.seller_id }}</span>
            </el-form-item>
            <el-form-item label="买家ID">
              <span>{{ props.row.buyer_id }}</span>
            </el-form-item>
            <el-form-item label="卖家手机">
              <span>{{ props.row.seller_telephone }}</span>
            </el-form-item>
            <el-form-item label="买家手机">
              <span>{{ props.row.buyer_telephone }}</span>
            </el-form-item>
            <el-form-item label="支付宝真实姓名">
              <span>{{ props.row.aliRealName }}</span>
            </el-form-item>
            <el-form-item label="支付宝号">
              <span>{{ props.row.alipay }}</span>
            </el-form-item>
            <el-form-item label="银行">
              <span>{{ props.row.bank }}</span>
            </el-form-item>
            <el-form-item label="支行">
              <span>{{ props.row.bank_branch }}</span>
            </el-form-item>
            <el-form-item label="银行卡号">
              <span>{{ props.row.bank_vard }}</span>
            </el-form-item>
            <el-form-item label="银行卡真实姓名">
              <span>{{ props.row.bankRealName }}</span>
            </el-form-item>
            <el-form-item label="订单创建时间">
              <span>{{ props.row.order_time }}</span>
            </el-form-item>
            <el-form-item label="支付时间">
              <span>{{ props.row.pay_time }}</span>
            </el-form-item>
            <el-form-item label="完成时间">
              <span>{{ props.row.finish_time }}</span>
            </el-form-item>
            <el-form-item :label="$t('common.remarks')">
              <span>{{ props.row.extral }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <el-table-column prop="seller_name" label="卖家名" />
      <el-table-column prop="buyer_name" label="买家名" />
      <el-table-column prop="currency" :label="$t('common.coin')" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="count" label="数量" />
      <el-table-column prop="total_price" label="支付数量" />
      <el-table-column prop="pay_method" label="支付方式" />
      <el-table-column prop="pay_code" label="支付码">
        <template slot-scope="scope">
          <img
            style="width: 30px;height: 30px;"
            :src="scope.row.pay_code"
            alt
            @click="imgSrcShow(scope.row.pay_code)"
          >
        </template>
      </el-table-column>
      <el-table-column prop="order_status" label="订单状态" />
      <el-table-column prop="finish_time" label="成交时间" />
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
import { listCtcOtcPrice, listAllOrder } from '@/api/otc'

export default {
  data() {
    return {
      // 币种选项
      coinOptions: [],
      dialogFormVisible1: false,
      imgSrc: '',
      loading: true,
      pageShow: true,
      currency: '',
      // 日期快捷选项
      // 币种下拉
      optionsStatus: [
        {
          value: 'finish',
          label: '已放币'
        },
        {
          value: '待支付',
          label: '待支付'
        },
        {
          value: '买方已支付',
          label: '买方已支付'
        },
        {
          value: '冻结中',
          label: '冻结中'
        },
        {
          value: '已完成',
          label: '已完成'
        },
        {
          value: '超时取消',
          label: '超时取消'
        },
        {
          value: '买方取消',
          label: '买方取消'
        },
        {
          value: '超时自动放币',
          label: '超时自动放币'
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
      formLabelWidth: '140px'
    }
  },
  created() {
    this.getCtcOtcCoinList()
    this.load()
  },
  methods: {
    getCtcOtcCoinList() {
      const data = {}
      listCtcOtcPrice(data).then(response => {
        if (response.code == 200 && response.total > 0) {
          this.coinOptions = response.rows
        } else {
          this.coinOptions = []
          this.msgError(response.msg)
        }
        this.loading = false
      }).catch(error => {
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
        status: this.status,
        currency: this.currency
      }
      listAllOrder(formData)
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
