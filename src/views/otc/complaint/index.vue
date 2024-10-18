<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item
        :label="$t('common.coin')"
        prop="currencyCode"
      >
        <el-select
          v-model="queryParams.currencyCode"
          filterable
          clearable
          size="mini"
          placeholder="请选择币种"
        >
          <el-option
            v-for="item in codeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="申诉状态:"
        prop="complaintStatus"
      >
        <el-select
          v-model="queryParams.complaintStatus"
          size="mini"
          clearable
          :placeholder="$t('common.all')"
        >
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="手机号/邮箱:"
        prop="queryKey"
      >
        <el-input
          v-model="queryParams.queryKey"
          placeholder="手机号/邮箱"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item
        label="订单ID:"
        prop="orderId"
      >
        <el-input
          v-model="queryParams.orderId"
          placeholder="订单ID"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item label="申诉创建时间:">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查找</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="table"
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="120"
        class-name
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleExpand(scope.$index, scope.row)"
          >展开
          </el-button>
          <el-button
            v-if="scope.row.complaintState == 1"
            size="mini"
            type="danger"
            @click="handleComplaintState(scope.$index, scope.row)"
          >
            处理申诉
          </el-button>
          <el-button
            v-if="scope.row.imageUrl"
            size="mini"
            type="primary"
            @click="handleViewImg(scope.$index, scope.row)"
          >查看截图
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="广告ID"
        align="center"
        prop="adsId"
      />
      <el-table-column
        label="订单ID"
        align="center"
        width="70"
        prop="orderId"
      />
      <el-table-column
        label="买方ID"
        align="center"
        width="70"
        prop="buyerId"
      />
      <el-table-column
        label="买方姓名"
        align="center"
        width="60"
        prop="buyerName"
      />
      <el-table-column
        label="买方手机号"
        align="center"
        width="60"
        prop="buyerPhone"
      />
      <el-table-column
        label="卖方ID"
        align="center"
        width="70"
        prop="sellerId"
      />
      <el-table-column
        label="卖方姓名"
        align="center"
        width="60"
        prop="sellerName"
      />
      <el-table-column
        label="卖方手机号"
        align="center"
        width="60"
        prop="sellerPhone"
      />
      <el-table-column
        label="交易数量"
        align="center"
        prop="volume"
      />
      <el-table-column
        label="交易金额"
        align="center"
        prop="totalPrice"
      />
      <el-table-column
        label="申诉原因"
        align="center"
        prop="complaintReason"
      />
      <el-table-column
        label="申诉判定"
        align="center"
        prop="victoryStatusName"
      />
      <el-table-column
        label="申诉状态"
        align="center"
        prop="complaintStateName"
      />
      <el-table-column
        label="申诉创建时间"
        align="center"
        prop="ctime"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="申诉处理结果"
        align="center"
        prop="complaintResultName"
      />
      <el-table-column
        label="申诉处理时间"
        align="center"
        prop="handleTimeStr"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.handleTimeStr) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="处理耗时"
        align="center"
        prop="consumingTime"
      />
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form
            label-position="top"
            inline
            class="demo-table-expand"
          >
            <el-row class="second-line">
              <el-form-item label="广告发布者ID">
                <span>{{ scope.row.adsUserId }}</span>
              </el-form-item>
              <el-form-item label="广告类型">
                <span>{{ scope.row.adsSide }}</span>
              </el-form-item>
              <el-form-item label="交易价格">
                <span>{{ scope.row.adsPrice }}</span>
              </el-form-item>
              <el-form-item label="成交数量">
                <span>{{ scope.row.adsVolume }}</span>
              </el-form-item>
              <el-form-item label="付款方式">
                <span>{{ scope.row.adsPayment }}</span>
              </el-form-item>
              <el-form-item label="创建时间">
                <span>{{ scope.row.adsCreateTime }}</span>
              </el-form-item>
              <el-form-item label="广告状态">
                <span>{{ scope.row.adsStatus }}</span>
              </el-form-item>
            </el-row>
            <el-divider />
            <el-row class="pay-box">
              <el-col :span="10">
                <el-divider>买家信息</el-divider>
                <el-form-item label="姓名">
                  <span>{{ scope.row.buyerName }}</span>
                </el-form-item>
                <el-form-item label="收款方式">
                  <span>{{ scope.row.payment }}</span>
                </el-form-item>
                <el-form-item label="账号">
                  <span />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                &nbsp;
              </el-col>
              <el-col :span="10">
                <el-divider>卖家信息</el-divider>
                <el-form-item label="姓名">
                  <span>{{ scope.row.sellerName }}</span>
                </el-form-item>
                <el-form-item label="收款方式">
                  <span>{{ scope.row.payment }}</span>
                </el-form-item>
                <el-form-item label="账号">
                  <span>{{ scope.row.payAccount }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 处理申诉对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="dialogForm"
        :model="dialogForm"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item
          label="申诉结果："
          prop="complaintResult"
          class="result-box"
        >
          <el-radio
            v-model="dialogForm.complaintResult"
            :label="1"
          >确定买方已付款（该操作会释放数字货币）</el-radio>
          <el-radio
            v-model="dialogForm.complaintResult"
            :label="2"
          >确定买方未付款，或双方协议取消订单（该操作会取消交易订单）</el-radio>
        </el-form-item>
        <el-form-item
          label="胜诉方："
          prop="victoryStatus"
        >
          <el-radio
            v-model="dialogForm.victoryStatus"
            :label="1"
          >不计胜诉</el-radio>
          <el-radio
            v-model="dialogForm.victoryStatus"
            :label="2"
          >买方胜诉</el-radio>
          <el-radio
            v-model="dialogForm.victoryStatus"
            :label="3"
          >卖方胜诉</el-radio>
        </el-form-item>
        <el-form-item
          label="处理结果备注："
          prop="remark"
        >
          <el-input
            v-model="dialogForm.remark"
            type="textarea"
            placeholder="请输入处理结果备注"
          />
        </el-form-item>
        <!-- <el-form-item class="grid-item"
                      label="证据图片：">
          <el-upload ref="upload"
                     action="#"
                     list-type="picture-card"
                     :on-change="handleChange"
                     :show-file-list="isShowFileList"
                     :auto-upload="false"
                     :file-list="fileList"
                     :before-remove="removeFile"
                     class="upload-demo">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item> -->
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!-- 冻结恢复广告权限对话框 -->
    <el-dialog
      title="回复问题"
      :visible.sync="adVisible"
      width="30%"
    >
      <span>{{ adText }}</span>
    </el-dialog>
    <!-- 证据图片对话框 -->
    <el-dialog
      title="证据图片"
      :visible.sync="imgVisible"
      width="60%"
      class="dialog-img"
    >
      <div>申诉原因：{{ complaintReason }}</div>
      <div
        v-for="(item, i) in imgList"
        :key="i"
        class="img-box"
      ><img :src="item"></div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { complaintList, handleComplaint, responseComplaint } from '@/api/otcComplaint'
import { filesUpload } from '@/api/upload/upload'
import { readString } from '@/api/upload/uploadAwsImg.js'
export default {
  name: 'Complaint',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 商户列表
      dataList: [],
      time: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        currencyCode: undefined,
        queryKey: undefined,
        complaintStatus: undefined,
        orderId: undefined,
        startTime: undefined,
        endTime: undefined
      },
      action: process.env.VUE_APP_BASE_API + '/coinbull/files/upload',
      // 是否显示弹出层
      open: false,
      dialogTitle: '场外交易申诉处理',
      // 添加、修改弹窗表单参数
      dialogForm: {},
      adVisible: false,
      adText: '',
      codeOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'USDT',
          label: 'USDT'
        }
      ],
      // 申诉
      stateOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '申诉中'
        },
        {
          value: '2',
          label: '已完成'
        },
        {
          value: '3',
          label: '申诉取消'
        }
      ],
      fileList: [],
      isShowFileList: false,
      // 回复
      responseForm: {},
      // 表单校验
      rules: {
        complaintResult: [
          { required: true, message: '请选择申诉结果', trigger: 'blur' }
        ],
        victoryStatus: [
          { required: true, message: '请选择胜诉方', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请填写处理结果备注', trigger: 'blur' }
        ]
      },
      imgList: [],
      complaintReason: '',
      imgVisible: false
    }
  },
  computed: {
    // ...mapState('systemsetting', ['currencyList']),
    // codeOptions () {
    //   return this.currencyList
    // }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 列表 */
    getList() {
      complaintList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      if (!this.queryParams.currencyCode) {
        this.queryParams.currencyCode = undefined
      }
      if (!this.queryParams.queryKey) {
        this.queryParams.queryKey = undefined
      }
      if (!this.queryParams.complaintStatus) {
        this.queryParams.complaintStatus = undefined
      }
      if (!this.queryParams.orderId) {
        this.queryParams.orderId = undefined
      }
      if (this.time && this.time[0]) {
        this.queryParams.startTime = new Date(this.time && this.time[0]).getTime()
      } else {
        this.queryParams.startTime = undefined
      }
      if (this.time && this.time[1]) {
        this.queryParams.endTime = new Date(this.time && this.time[1]).getTime()
      } else {
        this.queryParams.endTime = undefined
      }
      this.getList()
    },
    handleExpand(index, row) {
      const $table = this.$refs.table
      $table.toggleRowExpansion(row)
    },
    handleComplaintState(index, row) {
      this.dialogForm = {
      }
      this.resetForm('dialogForm')
      this.dialogForm.id = row.id
      this.open = true
    },
    // handleResponse () {
    //   this.responseForm.coinId = row.coinId
    //   this.getResponse()
    // },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.dialogForm = {

      }
      this.resetForm('dialogForm')
    },
    // 图片上传尺寸大小检验
    handleChange(file) {
      const _this = this
      const _URL = window.URL || window.webkitURL
      const img = new Image()
      img.src = _URL.createObjectURL(file.raw)
      img.onload = function() {
        _this.isShowFileList = true
        const params = {
          file: file.raw,
          newFileName: file.name.split('.')[0]
        }
        filesUpload(params).then(response => {
          if (response.code === 200) {
            _this.fileList.push(response.data)
            console.log(_this.fileList)
          } else {
            this.msgError(response.msg)
          }
        })
      }
    },
    removeFile(file) {
      console.log(file)
      // this.isShowFileList = false
      // this.fileList = []
      let idx = 0
      this.fileList.forEach((item, index) => {
        console.log(item)
        if (item.indexOf(file.name) != -1) {
          idx = index
        }
      })
      this.fileList.splice(idx, 1)
      console.log(this.fileList)
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['dialogForm'].validate(valid => {
        if (valid) {
          if (this.fileList.length > 0) {
            this.dialogForm.evidenceImageUrl = this.fileList.join(',')
          }
          handleComplaint(this.dialogForm).then(response => {
            if (response.code === 200) {
              this.msgSuccess('处理成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    // getResponse () {
    //   let param = {
    //     instrumentId: this.responseForm.coinId
    //   }
    //   responseComplaint(param).then(response => {
    //     if (response.code === 200) {
    //       this.adVisible = false;
    //     } else {
    //       this.msgError(response.msg);
    //     }
    //   });
    // },
    // 替换图片
    replacePictureStream(url) {
      const params = {}
      params.url = url
      return new Promise((resolve, reject) => {
        readString(params).then(res => {
          const msg = res.msg
          let url = ''
          if (msg == '' || msg == null || msg == undefined) {
            url = 'https://coinstore-sg.oss-accelerate.aliyuncs.com/filesUpload/1626323598251_c19b584f9e594fd19ee04bb2d9a08947.jpg'
          } else {
            url = msg
          }
          resolve(url)
        }).catch(error => {
          console.log(error.data)
          reject()
        })
      })
    },
    handleViewImg(index, row) {
      const imgStr = row.imageUrl
      // imgStr = 'https://coinstore-nx.s3.cn-northwest-1.amazonaws.com.cn/filesUpload/ex1/setting/2d448a63c3234d84b807e3d078e24cba_1650358068820.jpg,https://coinstore-nx.s3.cn-northwest-1.amazonaws.com.cn/filesUpload/ex1/setting/fbb882de3fcb434d95743abecd074838_1650358073540.jpg'
      this.imgList = []
      this.complaintReason = ''
      this.complaintReason = row.complaintReason
      let arr = []
      if (imgStr) {
        arr = imgStr.split(',')
        arr.forEach((item, index) => {
          this.replacePictureStream(item).then(data => {
            // this.imgSrc.img1 = data
            this.imgList.push(data)
          })
        })
      }
      this.imgVisible = true
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    .el-col {
      margin-right: 10px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
    }
    .result-box {
      line-height: 30px;
    }
  }
  .el-form-item {
    margin: 0 0 22px;
  }
  .second-line {
    .el-form-item {
      margin: 0;
      width: 13%;
      text-align: center;
    }
  }
  .pay-box {
    .el-form-item {
      margin: 0;
      width: 30%;
      text-align: center;
    }
  }
  .dialog-img {
    .img-box {
      display: inline-block;
      width: 50%;
      padding: 10px;
      margin: 20px 0 0 0;
      img {
        width: 100%;
      }
    }
  }
}
</style>
