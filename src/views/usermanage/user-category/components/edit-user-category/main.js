import { saveSingleUserCategory } from '@/api/user'
import router from '@/router'
import { watchRouteChangeOnce } from '@/utils'
import { getAllUserCategoryList } from '@/views/usermanage/user-category/data'

let callbackOfOpen = () => {}

export default {
  name: 'EditUserCategory',
  data() {
    return {
      list: [],
      show: false,
      info: {},
      form: {
        uid: null,
        classId: null
      },
      rules: {
        classId: [
          { required: true, message: '请选择用户分类 ID', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    async open(info, callback) {
      this.list = await getAllUserCategoryList()

      this.show = true
      this.info = info
      this.form.uid = info.uid
      callbackOfOpen = callback

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
        await saveSingleUserCategory(this.form)
        this.close()
        this.msgSuccess('操作成功')
        callbackOfOpen()
      } catch (e) {
      }
    }
  },
  render() {
    return (<el-dialog title="修改个人分类" width="500px" visible={this.show} on={{ 'update:visible': bool => this.show = bool }}>
      <div class="content">
        <p>UserId: {this.info.userId}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用户 UID: {this.info.uid}</p>
        <p>当前用户分类ID: {this.info.classCode}</p>

        <el-form ref="form" props={ { model: this.form } } rules={this.rules}>

          <el-form-item label="修改后的用户分类 ID:" prop="classId">

            <el-select value={this.form.classId} size="mini" filterable clearable placeholder="请选择用户分类 ID" onInput={classId => this.form.classId = classId}>
              { this.list.map(item => (<el-option key={item.id} label={item.classCode} value={item.id} disabled={item.id === this.info.classId } />)) }
            </el-select>

            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

            <el-button type="text" size="mini" onClick={() => router.push({ name: 'userCategoryCreate' })}>+新增用户分类</el-button>
          </el-form-item>

        </el-form>
      </div>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>)
  }
}
