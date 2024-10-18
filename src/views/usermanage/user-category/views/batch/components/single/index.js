import Manual from './components/manual'
import Excel from './components/excel'

export default {
  name: 'Single',
  props: {
    type: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      kind: 'manual'
    }
  },
  render() {
    const typeName = this.type === 'add' ? '添加' : (this.type === 'edit' ? '修改' : '删除')

    return <div>
      <el-radio-group value={this.kind} onInput={ kind => this.kind = kind }>
        <el-radio-button label="manual">手动{typeName}</el-radio-button>
        <el-radio-button label="excel">批量{typeName}</el-radio-button>
      </el-radio-group>

      { this.kind === 'manual' && <Manual type={this.type} /> }
      { this.kind === 'excel' && <Excel type={this.type} /> }

    </div>
  }
}
