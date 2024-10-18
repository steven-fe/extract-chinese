import { watchRouteChangeOnce } from '@/utils'
import styles from './index.module.scss'
import { Message, MessageBox } from 'element-ui'

const staticData = {
  templateUrl: '',
  uploadApi: null,
  downloadErrorApi: null
}

let callbackOnSubmit = () => {}

export default {
  name: 'Batch',
  data() {
    return {
      show: false,
      title: '',
      tips: '',
      file: null
    }
  },
  methods: {
    async open({ templateUrl, title, tips, uploadApi, downloadErrorApi }, callback = () => {}) {
      this.show = true
      this.title = title
      this.tips = tips

      staticData.templateUrl = templateUrl
      staticData.uploadApi = uploadApi
      staticData.downloadErrorApi = downloadErrorApi

      callbackOnSubmit = callback
      watchRouteChangeOnce(() => this.close())
    },
    close() {
      this.show = false
      this.file = null
      this.$refs.upload.clearFiles()
    },
    async submit() {
      const { data } = await staticData.uploadApi(this.file)
      const { sucCount, errorCount } = data

      try {
        await MessageBox.confirm(
          `导入数据成功：${sucCount}条，失败：${errorCount}条。${errorCount ? '<br/><br/>内容有误的数据已经在文件中标出，请下载文件查看错误说明，再次上传导入。' : ''}`,
          '提示',
          {
            showConfirmButton: !!errorCount,
            confirmButtonText: '下载错误文件',
            cancelButtonText: '关闭',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        )
        staticData.downloadErrorApi(data)
      } catch (e) {}
    }
  },
  render() {
    return (<el-dialog width="500px" title={this.title} visible={this.show} closeOnClickModal={false} closeOnPressEscape={false} on={{ 'update:visible': () => this.close() }}>
      <ol class={styles.steps}>
        <li class={styles.step}>
          <h3>1.下载模板</h3>
          <el-button type="primary" size="mini" onClick={() => window.open(staticData.templateUrl, '_blank')}>下载模版</el-button>
        </li>
        <li class={styles.step}>
          <h3>2.选择填写好的文件</h3>
          <el-upload
            ref="upload"
            action="#"
            limit={1}
            autoUpload={false}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            props={{
              'on-exceed': () => Message({ message: '请删除后再上传', type: 'error' }),
              'on-remove': () => (this.file = null),
              'on-change': (file) => (this.file = file.raw)
            }}
          >
            <el-button slot="trigger" type="primary" size="mini" icon="el-icon-upload">上传文件</el-button>
            <div slot="tip" class="el-upload__tip">支持上传的格式为 csv、xlsx</div>
          </el-upload>
        </li>
        <li class={styles.step}>
          <h3>3.确认导入</h3>
          <el-button type="primary" size="mini" disabled={!this.file} onClick={this.submit}>确认导入</el-button>
        </li>
      </ol>
      <p domPropsInnerHTML={this.tips} />
    </el-dialog>)
  }
}
