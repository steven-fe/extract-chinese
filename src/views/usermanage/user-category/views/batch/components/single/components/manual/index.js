import { getAllUserCategoryList } from '@/views/usermanage/user-category/data'
import { saveManualBatchAddUserCategory, updateManualBatchAddUserCategory, removeManualBatchAddUserCategory } from '@/api/user'
import Tips from '../tips'
import { instance as successModal } from '../success'

const maxLenOfUserId = 100

const formRuleCheckUserIds = (vm, _1, _2, callback) => {
  if (!vm.totalOfUserId) return callback('请输入UserID')
  if (vm.totalOfUserId > maxLenOfUserId) return callback(`导入条数超出限制：${maxLenOfUserId}条，请重新上传！`)
  return callback()
}

export default {
  name: 'Manual',
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
        uids: '',
        classId: null
      },
      rules: {
        uids: [
          { required: true, validator: formRuleCheckUserIds.bind(null, this), trigger: 'change' }
        ],
        classId: [
          { required: true, message: '请选择用户分类 ID', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    totalOfUserId() {
      return this.form.uids.split(',').filter(userId => !!userId).length
    }
  },
  methods: {
    async submit() {
      try {
        await this.$refs.form.validate()
        const { data } = await (this.type === 'add' ? saveManualBatchAddUserCategory : (this.type === 'edit' ? updateManualBatchAddUserCategory : removeManualBatchAddUserCategory))(this.form)

        successModal.open({ ...data, batchNo: this.form.batchNo }, () => (this.form.batchNo = String(+new Date())))
      } catch (e) {}
    }
  },
  async created() {
    this.list = await getAllUserCategoryList()
  },
  render() {
    return <div style="width: 830px;">
      <h3>批次号：{this.form.batchNo}</h3>
      <Tips type={this.type} />

      <el-form ref="form" props={ { model: this.form } } rules={this.rules}>

        <el-form-item label="" prop="uids">
          <el-input value={this.form.uids} type="textarea" placeholder="请输入UID，多个ID之间以,分割" onInput={ uids => this.form.uids = uids } onChange={ () => this.form.uids = this.form.uids.trim() } />
          <p style="margin: 0; font-size: 12px; line-height: 18px; text-align: right;">{this.totalOfUserId}个/{maxLenOfUserId}个</p>
        </el-form-item>

        {
          this.type !== 'remove' &&
          <el-form-item label="添加的用户分类 ID:" prop="classId">
            <el-select value={this.form.classId} size="mini" filterable clearable placeholder="请选择用户分类 ID" onInput={classId => this.form.classId = classId}>
              { this.list.map(item => (<el-option key={item.id} label={item.classCode} value={item.id} />)) }
            </el-select>
          </el-form-item>
        }

      </el-form>

      <div class="footer">
        <el-button type="primary" onClick={this.submit}>确 认</el-button>
      </div>

    </div>
  }
}
