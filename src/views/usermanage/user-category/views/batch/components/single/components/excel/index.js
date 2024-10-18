import { saveExcelBatchAddUserCategory, updateExcelBatchAddUserCategory, removeExcelBatchAddUserCategory } from '@/api/user'
import Tips from '../tips'
import { instance as successModal } from '../success'

export default {
  name: 'Excel',
  props: {
    type: {
      type: String
    }
  },
  data() {
    return {
      list: [],
      form: {
        batchNo: String(+new Date()),
        file: null
      },
      rules: {
        file: [
          { required: true, message: '请上传文件', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    async submit() {
      try {
        await this.$refs.form.validate()
        const { data } = await (this.type === 'add' ? saveExcelBatchAddUserCategory : (this.type === 'edit' ? updateExcelBatchAddUserCategory : removeExcelBatchAddUserCategory))(this.form)

        successModal.open({ ...data, batchNo: this.form.batchNo }, () => {
          this.form.batchNo = String(+new Date())
          this.$refs.upload.clearFiles()
        })
      } catch (e) {}
    }
  },
  render() {
    return <div style="width: 400px;">
      <h3>批次号：{this.form.batchNo}</h3>
      <Tips type={this.type} />

      <el-form ref="form" props={ { model: this.form } } rules={this.rules}>

        <el-form-item label="" prop="file">
          <el-upload
            ref="upload"
            action="#"
            limit={1}
            autoUpload={false}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            props={{
              'on-exceed': this.msgSuccess.bind(this, '请删除后再上传'),
              'on-remove': () => (this.form.file = null, this.$refs.form.validateField('file')),
              'on-change': (file) => (this.form.file = file.raw, this.$refs.form.validateField('file'))
            }}
          >
            <el-button slot="trigger" size="small" icon="el-icon-upload">上传文件</el-button>
            <el-link type="primary" href="https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/userClassDataTemplate.xls" target="_blank">&nbsp;&nbsp;&nbsp;下载导入模板（一次最多2000条）</el-link>
            <div slot="tip" class="el-upload__tip">支持上传的格式为 csv、xlsx</div>
          </el-upload>
        </el-form-item>

      </el-form>

      <div class="footer">
        <el-button type="primary" onClick={this.submit}>确 认</el-button>
      </div>

    </div>
  }
}
