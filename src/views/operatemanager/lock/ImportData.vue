<template>
  <el-dialog :title="title" :visible.sync="show" width="600px" :close-on-click-modal="false">
    <div class="setup">
      <div class="step">
        <div>1.{{ $t('contractmanager.downloadTemplate') }}</div>
        <el-button type="primary" size="mini" @click="downTemplate">{{ $t('financemanager.downloadTemplate') }}</el-button>
      </div>
      <div class="step" style="width: 150px">
        <div>2.{{ $t('financemanager.selectTheCompletedDocument') }}</div>
        <el-upload
          ref="upload"
          class="upload-demo"
          action="#"
          :before-upload="beforeUpload"
          :http-request="uploadData"
          :limit="1"
          :file-list="fileList"
          :auto-upload="false"
        >
          <el-button slot="trigger" size="small" type="primary">{{ $t('contractmanager.selectFile') }}</el-button>
          <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </div>
      <div class="step">
        <div>3.{{ $t('financemanager.confirmImport') }}</div>
        <el-button type="primary" size="mini" @click="submitUpload">{{ $t('financemanager.confirmImport') }}</el-button>
      </div>
    </div>
    <slot />
  </el-dialog>
</template>

<script>
import { importList, exportError } from '@/api/operate/lock'

export default {
  name: 'ImportData',
  props: {
    title: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: '' // 0 余额锁仓 1 空投锁仓
    }
  },
  data() {
    return {
      show: false,
      fileList: [], // 文件列表
      timeStamp: new Date().getTime() // 唯一时间戳
    }
  },
  methods: {
    init() {
      this.show = true
      this.$refs.upload.clearFiles()
    },
    // 上传之前
    beforeUpload(file) {
      console.log('导入数据', file)
      const index = file.name.lastIndexOf('.')
      const type = file.name.substring(index + 1, file.name.length)
      if (type !== 'xlsx' && type !== 'xls') {
        this.$message.error('请选择xlsx、xls格式的文件')
        return false
      }
    },
    uploadData(data) {
      this.$confirm(this.$t('currencymanager.issueLockUpTokensImmediately'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.timeStamp = new Date().getTime() // 唯一时间戳
        const param = {
          file: data.file,
          timeStamp: this.timeStamp,
          type: this.type
        }
        importList(param).then(res => {
          if (res.code === 200) {
            // code: 200
            // msg: "导入数据成功：1条，失败：0条"
            this.$refs.upload.clearFiles()
            this.$emit('success')

            // errorCount: 11
            // msg: "导入数据成功：1条，失败：11条"
            // sucCount: 1
            // 如果有失败的数据
            if (res.data.errorCount && res.data.errorCount > 0) {
              const msg = `<div>${this.$t('operatemanager.importDataTips', {sucCount: res.data.sucCount, errorCount: res.data.errorCount})}</div> <div>${this.$t('operatemanager.importDataErrorTips')}</div>`
              this.$confirm(msg, this.$t('common.prompt'), {
                confirmButtonText: this.$t('currencymanager.downloadTagDocument'),
                cancelButtonText: this.$t('systemsetting.closed'),
                type: 'warning',
                dangerouslyUseHTMLString: true
              }).then(() => {
                // 下载标记文档
                exportError({ timeStamp: this.timeStamp }).then(res => {
                  if (res.code === 200) {
                    this.download(res.msg)
                  }
                })
              }).catch(() => {
                // this.show = false
              })
            } else {
              // 如果全部导入成功
              this.$alert(`${this.$t('currencymanager.successNum', {sucCount: res.data.sucCount})}`, this.$t('common.prompt'), {
                confirmButtonText: this.$t('common.sure'),
                callback: action => {
                  this.show = false
                }
              })
            }
          } else {

          }
        })
      }).catch(() => {

      })
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    downTemplate() {
      // 下载模版
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/UserLockPositionInfo.xlsx')
    }
  }
}
</script>

<style lang="scss" scoped>
.setup {
    display: flex;
    justify-content: space-around;
    .step {
        text-align: center;
        div {
            margin-bottom: 10px;
        }
    }
}
</style>
