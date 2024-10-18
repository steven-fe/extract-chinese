import Single from './components/single'

export default {
  name: 'Batch',
  data() {
    return {
      curTabName: 'add'
    }
  },
  methods: {
  },
  render() {
    return <div class="app-container">
      <el-tabs value={this.curTabName} on={{ 'tab-click': tab => this.curTabName = tab.name }}>
        <el-tab-pane label="批量添加" name="add">
          <Single />
        </el-tab-pane>

        <el-tab-pane label="批量修改" name="edit">
          <Single type="edit" />
        </el-tab-pane>

        <el-tab-pane label="批量删除" name="remove">
          <Single type="remove" />
        </el-tab-pane>
      </el-tabs>
    </div>
  }
}
