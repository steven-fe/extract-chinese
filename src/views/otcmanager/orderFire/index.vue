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
      <el-table-column prop="appeal_time" label="申诉时间" />
      <el-table-column :label="$t('common.operation')" width="220">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
          <el-button size="mini" type="warning" @click="handleReview(scope.row,'cancel')">撤单</el-button>
          <el-button size="mini" type="danger" @click="handleReview(scope.row,'freed')">放币</el-button>
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
    <el-dialog title="查看图片" :visible.sync="dialogFormVisible1">
      <img style="display: block;margin: 0 auto;width: 600px;" :src="imgSrc" alt>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible1 = false">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="title" :visible.sync="dialogFormReview">
      <el-form :model="digform" class="demo-form-inline">
        <el-form-item :label="$t('common.remarks')" label-width="80px">
          <el-input v-model="digform.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormReview = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleAppealReview">{{ handle }}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="查看申诉凭证" :visible.sync="dialogFormVisible">
      <div>
        <el-row :gutter="20" type="flex" style="flex-wrap: wrap;">
          <el-col
            v-for="(item, index) in appealList"
            :key="index"
            :span="8"
            style="padding-bottom:20px;"
          >
            <el-card :body-style="{ padding: '0px' }">
              <img :src="item.pic" class="image" @click="imgSrcShow(item.pic)">
              <div style="padding: 14px;">
                <el-collapse>
                  <el-collapse-item title="申诉内容" name="1">
                    <span>{{ item.extral }}</span>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible = false">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAllOrder, listAppealOrders, appealReview } from '@/api/otc'

export default {
  data() {
    return {
      dialogFormVisible1: false,
      appealList: [],
      dialogFormVisible: false,
      dialogFormReview: false,
      imgSrc: '',
      loading: true,
      pageShow: true,
      // 日期快捷选项
      // 币种下拉
      like: '',
      status: '',
      title: '',
      handle: '',
      startDate: '',
      endDate: '',
      pageSize: 10,
      radio: '2',
      pageNum: 1,
      action: '',
      tableData: [],
      total: 0,
      form: {
        phone: '1',
        pic: '',
        orderId: '1',
        userId: '1',
        extral: '1',
        status: '1',
        createTime: '1'
      },
      digform: {
        remark: ''
      },
      formLabelWidth: '140px'
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    handleEdit(row, index) {
      this.appealList = []
      listAppealOrders({ orderId: index.id })
        .then(response => {
          if (response.code == 200 && response.total > 0) {
            this.appealList = response.rows
            this.dialogFormVisible = true
          } else {
            this.$message({
              showClose: true,
              message: '暂无凭证',
              type: 'success'
            })
          }
          this.dialogFormVisible = true
        })
        .catch(error => {
          console.log(error)
        })
    },
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
        status: '冻结中'
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
    handleAppealReview() {
      const data = {
        action: this.action,
        orderId: this.digform.id,
        remark: this.digform.remark
      }
      appealReview(data)
        .then(response => {
          if (response.code == 200) {
            this.msgSuccess('申诉处理完成')
          } else {
            this.msgError(response.msg)
          }
          this.dialogFormReview = false
          this.load()
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 索引值
    indexMethod(index) {
      return index + (this.pageNum - 1) * this.pageSize + 1
    },
    handleReview(row, action) {
      this.dialogFormReview = true
      this.digform = Object.assign({}, row)
      this.action = action
      if (action === 'cancel') {
        this.title = '撤单处理'
        this.handle = '确定撤单'
      } else {
        this.title = '放币处理'
        this.handle = '确定放币'
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
.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
</style>
