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
          :disabled="errorExcelState !== 'over'"
        >
          <el-button slot="trigger" size="small" type="primary" :disabled="errorExcelState !== 'over'">{{ $t('contractmanager.selectFile') }}</el-button>
          <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </div>
      <div class="step">
        <div>3.{{ $t('financemanager.confirmImport') }}</div>
        <el-button type="primary" size="mini" :disabled="errorExcelState !== 'over'" @click="submitUpload">{{ $t('financemanager.confirmImport') }}</el-button>
      </div>
    </div>

    <slot />

    <el-table v-if="excelSuccessTableData.length" :data="excelSuccessTableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="currencyCode" :label="$t('common.coin')" align="center" />
      <el-table-column prop="amount" :label="$t('financemanager.unlockQuantity')" align="center" />
      <el-table-column prop="count" :label="$t('financemanager.numberOfBranches')" align="center" />
    </el-table>

    <br>
    <template v-for="item in errorExcelList">
      <el-button v-if="item.status === 1" :key="item.batchId" type="danger" @click="downErrorFile(item.batchId)">{{ $t('financemanager.downloadTheFileThatFailedToExecute') }}（{{ item.batchId }}）</el-button>
      <el-button v-else :key="item.batchId" type="danger" :loading="true">{{ $t('dwmanager.beingProcessed') }}（{{ item.batchId }}）</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { unlockBatchAdd, unlockExportError, getBatchRecordList, getExcelFileName } from '@/api/operate/lock'

export default {
  name: 'ImportData',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      show: false,
      fileList: [], // 文件列表
      timeStamp: new Date().getTime(), // 唯一时间戳
      excelSuccessTableData: [],
      errorExcelState: 'unknown', // 'unknown', 'pending', 'over'
      errorExcelList: []
    }
  },
  methods: {
    init() {
      this.show = true

      this.taskResultPolling()

      /** wait ref.upload render */
      this.$nextTick(() => {
        this.$refs.upload.clearFiles()
      })
    },
    // 上传之前
    beforeUpload(file) {
      console.log('导入数据', file)
      const index = file.name.lastIndexOf('.')
      const type = file.name.substring(index + 1, file.name.length)
      if (type !== 'xlsx' && type !== 'xls') {
        this.$message.error(this.$t('financemanager.selectTheFormatOfTheFile'))
        return false
      }
    },
    uploadData(data) {
      this.$confirm(this.$t('financemanager.makeSureToUnlockTheUserlockTokenImmediately'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const param = {
          file: data.file,
          timeStamp: this.timeStamp
        }
        unlockBatchAdd(param).then(res => {
          if (res.code === 200) {
            this.$refs.upload.clearFiles()
            this.taskResultPolling()
            this.$message({ type: 'success', message: this.$t('financemanager.importSuccessfully') })
          } else {

          }
        })
      }).catch(() => {

      })
    },
    taskResultPolling: (() => {
      let timer = null
      let registerBeforeHideHook = false

      const fn = async function() {
        try {
          const { data } = await getBatchRecordList() || {}

          this.errorExcelState = !Array.isArray(data) || !data.length || data.at(-1).status === 1 ? 'over' : 'pending'
          this.excelSuccessTableData = this.errorExcelState === 'over' && data.at(-1) ? data.at(-1).list : []
          this.errorExcelList = data || []

          if (this.errorExcelState === 'over') clearTimeout(timer)
          else timer = setTimeout(fn.bind(this), 5 * 1000)
        } catch (e) {
          timer = setTimeout(fn.bind(this), 5 * 1000)
          console.error(e.message)
        }
      }

      return function() {
        clearTimeout(timer)
        fn.call(this) // execute immediately
        timer = setTimeout(fn.bind(this), 5 * 1000)

        if (!registerBeforeHideHook && (registerBeforeHideHook = true)) {
          const unwatch = this.$watch('show', (show) => {
            if (show) return
            if (unwatch) unwatch()

            timer = null
            registerBeforeHideHook = false
            clearTimeout.bind(null, timer)
          })
        }
      }
    })(),
    async downErrorFile(batchId) {
      const { code, data } = await getExcelFileName(batchId)

      if (code !== 200) return

      this.taskResultPolling() // updateRecordList

      this.download(data.fileName)
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    downTemplate() {
      // 下载模版
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/UserUnLockPositionInfo.xlsx')
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
