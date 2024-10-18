<template>
  <div class="app-container">
    <div class="df">
      <div class="left">
        <div style="font-size: 25px; margin-bottom: 30px;">{{$t('frozen.checkTheAvailableBalanceOfTheCashAccount')}}{{ recordData && recordData.status === 0 ? $t('dwmanager.beingProcessed') : '' }}</div>
        <el-form ref="form" :inline="true" :model="form">
          <el-form-item>
            <el-upload
              ref="upload"
              action="#"
              :on-change="handleChange"
              :show-file-list="false"
              accept=".xls,.xlsx"
              :auto-upload="false"
              class="upload-demo"
            >
              <el-button type="primary">{{$t('frozen.uploadExcel')}}Excel</el-button>
              <span style="font-size: 14px; color: #999">{{ fileName }}</span>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="downLoad">{{$t('financemanager.downloadTemplate')}}</el-button>
            <el-button type="primary" @click="batchAdd">{{$t('financemanager.confirmImport')}}</el-button>
          </el-form-item>
        </el-form>
        <div v-if="status === 1">
          <el-button type="primary" @click="uploadResult">{{$t('frozen.downloadQueryResults')}}</el-button>
          <span style="font-size: 14px; color: #999">{{$t('frozen.downloadQueryResults')}}</span>
        </div>
      </div>
      <div class="right">
        {{$t('frozen.manualOperationFrozenBalanceFunctionDescription')}}<br>
        {{$t('frozen.viewAvailableAssets')}}<br>
        {{$t('frozen.viewAssetsWithFrozenBalances')}}<br>
        <br>
        {{$t('frozen.documentMustInclude')}}<br>
        {{$t('frozen.userUID')}}<br>
        {{$t('frozen.currencyName')}}<br>
        <br>
        {{$t('frozen.maximumNumberOfDataFilesToBeUploadedIs1K')}}<br>
      </div>
    </div>
  </div>
</template>
<script>
import { uploadQueryAssetExcel, getBatchQueryAssetRecord, getBatchQueryAssetExcel } from '@/api/finance/check-balance'
export default {
  name: 'CheckBalance',
  data() {
    return {
      form: {
        file: null
      },
      fileName: this.$t('financemanager.unselectedFile'),
      status: '',
      batchNo: '',
      timer: null,
      recordData: {},
      downloadFileName: ''
    }
  },
  created() {
    this.getQueryResult()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    // 文件上传
    handleChange(file) {
      this.form.file = file.raw
      this.fileName = file.name
    },
    // 获取查询余额进度
    async getQueryResult() {
      const { data } = await getBatchQueryAssetRecord()
      // 0:进行中 1:处理完成，当状态值为1 时，出现下载查询结果按钮
      this.recordData = data
      if (data && data.status === 1) {
        this.batchNo = data.batchNo
        this.status = 1
        getBatchQueryAssetExcel({ batchNo: this.batchNo }).then(res => {
          this.downloadFileName = res.data.fileName
        })
      }
      if (data && data.status === 0 && !this.timer) {
        this.timer = setInterval(() => {
          if (!this.recordData || this.recordData.status !== 0) {
            clearInterval(this.timer)
            this.timer = null
          } else {
            this.getQueryResult()
          }
        }, 5000)
      }
    },
    // 批量上传
    batchAdd() {
      if (!this.form.file) {
        this.$message({
          type: 'error',
          message: this.$t('financemanager.unuploadedFile')
        })
        return
      }
      this.$confirm(this.$t('frozen.areYouSureYouWantToDoThis'), this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        uploadQueryAssetExcel(this.form).then(res => {
          setTimeout(() => {
            this.getQueryResult()
          }, 1000)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('frozen.cancelSuccess')
        })
      })
    },
    uploadResult() {
      this.download(this.downloadFileName)
    },
    // 下载模版
    downLoad() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/batchQuerySpotBalanceTemplate.xlsx')
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.df {
  display: flex;
  .right {
    margin-left: 200px;
    border: 1px solid rgb(228, 225, 225);
    padding: 10px;
    color: rgb(133, 129, 129);
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
</style>
