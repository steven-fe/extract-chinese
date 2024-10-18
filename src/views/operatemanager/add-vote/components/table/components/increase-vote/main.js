import { watchRouteChangeOnce } from '@/utils'
import { addVote } from '@/api/operate/vote-for-listing'

let callbackOnSubmit = () => {}

export default {
  name: 'IncreaseVote',
  data() {
    return {
      show: false,

      form: {
        id: null,
        voteNum: null
      },
      rules: {
        voteNum: [
          { required: true, message: '请填写虚增票数', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async open(id, callback) {
      this.show = true
      this.form.id = id
      callbackOnSubmit = callback
      watchRouteChangeOnce(() => this.close())
    },
    close() {
      this.show = false
      this.$refs.form.resetFields()
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    async submit() {
      try {
        await this.$refs.form.validate()
        await addVote(this.form)
        callbackOnSubmit()
        this.close()
        this.msgSuccess('操作成功')
      } catch (e) {
      }
    }
  },
  render() {
    return (<el-dialog title="虚增票数" width="240px" visible={this.show} on={{ 'update:visible': () => this.close() }}>
      <el-form ref="form" props={ { model: this.form } } rules={this.rules}>

        <el-form-item label="" prop="voteNum">
          <el-input-number value={this.form.voteNum} onInput={ voteNum => this.form.voteNum = voteNum } />
        </el-form-item>

      </el-form>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>)
  }
}
