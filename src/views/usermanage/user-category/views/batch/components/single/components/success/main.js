import router from '@/router'
import { exportUserListOfFailedUserCategory } from '@/api/user'
import { watchRouteChangeOnce } from '@/utils'

let callbackOfOpen = () => {}

export default {
  name: 'Success',
  data() {
    return {
      show: false,
      info: {}
    }
  },
  methods: {
    async open(info, callback) {
      this.show = true
      this.info = info
      callbackOfOpen = callback || callbackOfOpen

      watchRouteChangeOnce(() => this.close())
    },
    async exportFail() {
      const { msg } = await exportUserListOfFailedUserCategory(this.info.batchNo)
      this.download(msg)
    },
    close() {
      this.show = false
      callbackOfOpen()
    }
  },
  render() {
    return (<el-dialog width="500px" visible={this.show} closeOnClickModal={false} closeOnPressEscape={false} showClose={false} center>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <i class="el-icon-success" style="color: green; font-size: 100px;" />
        <h3>提交成功</h3>
        <p>本次导入数据：{this.info.total}条，成功{this.info.success}条，失败{this.info.fail}条</p>
        <el-button type="text" size="mini" onClick={this.exportFail}>导出本批次失败数据</el-button>
      </div>

      <div slot="footer">
        <el-button type="primary" onClick={this.close}>关闭</el-button>
      </div>
    </el-dialog>)
  }
}
