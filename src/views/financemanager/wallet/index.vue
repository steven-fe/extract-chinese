<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="realName " placeholder="模糊查询" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="currency" clearable placeholder="请选择币种">
            <el-option key="USDT" label="USDT" value="USDT" />
            <el-option key="TAI" label="TAI" value="TAI" />
            <el-option key="TUR" label="TUR" value="TUR" />
            <el-option key="HKR" label="HKR" value="HKR" />
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
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="userId" label="用户ID" />
      <el-table-column prop="currency" :label="$t('common.coin')" />
      <el-table-column prop="amount" label="数量" />
      <el-table-column prop="address" label="钱包地址">
        <template slot-scope="scope">
          <p @click="ermImg(scope.row.address)">{{ scope.row.address }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="createdate" label="创建时间" />
      <el-table-column :label="$t('common.operation')" width="160">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">审核</el-button>
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
    <el-dialog title="提现审核" :visible.sync="dialogFormVisible">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item label="审核" :label-width="formLabelWidth">
          <el-radio v-model="form.status" label="2">同意</el-radio>
          <el-radio v-model="form.status" label="3">拒绝</el-radio>
        </el-form-item>
        <el-form-item v-if="form.status == 3" label="理由" :label-width="formLabelWidth">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="查看二维码" :visible.sync="dialogFormVisibles">
      <div id="qrcode" ref="qrcode" style="margin: 0 auto;width: 200px;height: 200px;" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibles = false">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { listWithdrawal, rejectWithdraw, acceptWithdraw } from '@/api/wallet'
import QRCode from 'qrcodejs2'

export default {
  data() {
    return {
      dialogFormVisible: false,
      dialogFormVisibles: false,
      loading: true,
      realName: '',
      currency: '',
      form: {
        status: '',
        remark: '',
        id: ''
      },
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
    ermImg(qrUrl) {
      this.dialogFormVisibles = true
      this.$nextTick(() => {
        this.qrcode(qrUrl)
      })
    },
    qrcode(url) {
      /* eslint-disable */
      document.getElementById("qrcode").innerHTML = "";
      let qrcode = new QRCode("qrcode", {
        width: 200, // 设置宽度，单位像素
        height: 200, // 设置高度，单位像素
        text: url // 设置二维码内容或跳转地址
      });
    },
    handleEdit(row, index) {
      this.form.id = index.id;
      this.dialogFormVisible = true;
    },
    handleEdits(row, index) {
      this.$router.push({
        name: "lookInfo",
        params: { id: index.userId, currency: index.currency }
      });
    },
    handleEditTure() {
      if (this.form.status == 3 && this.form.remark.length == 0) {
        this.$message({
          showClose: true,
          message: "请填写全部信息",
          type: "error"
        });
        return;
      }
    },

    // 加载
    load() {
      this.loading = true;

      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        status: this.status,
        currency: this.currency,
        like: this.realName
        // "startDate": this.formatDate(this.startDate),
        // "endDate": this.formatDate(this.endDate),
      };
      //去空值
      const data = {};
      for (let list in formData) {
        if (formData[list]) {
          if (formData[list].length !== 0) {
            data[list] = formData[list];
          }
        }
      }
      listWithdrawal(data)
        .then(response => {
          if (response.code == 200) {
            this.tableData = response.rows;
            this.total = response.total;
          } else {
            this.tableData = [];
            this.total = 0;
            this.msgError(response.msg);
          }
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
        });
    },
    //索引值
    indexMethod(index) {
      return index + (this.pageNum - 1) * this.pageSize + 1;
    },
    //日期处理
    formatDate(time) {
      if (time) {
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        return year + "-" + month + "-" + day;
      } else {
        return "";
      }
    }
  }
};
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
