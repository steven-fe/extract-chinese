import { publishAll } from '@/api/kingkong-area'
import { stateMap } from '../../data'

export default {
  name: 'Query',
  props: {
    params: {
      type: Object
    }
  },
  methods: {
    change(options) {
      this.$emit('change', options)
    }
  },
  render() {
    return <el-form ref="queryForm" props={ { model: this.params } } inline>

      <el-form-item label="标题">
        <el-input value={this.params.title} placeholder="请输入标题" clearable size="mini" onInput={title => this.change({ title: title || null })} />
      </el-form-item>

      <el-form-item label="状态">
        <el-select value={this.params.state} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ state: typeof id === 'number' ? id : id || null })}>
          { [...stateMap.values()].map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'query')}>查询</el-button>
        <el-button type="success" size="mini" onClick={this.$emit.bind(this, 'add')}>添加</el-button>
        <el-button
          type="primary"
          size="mini"
          onClick={async() => {
            await publishAll()
            this.$emit('query')
          }}>一键发布上线</el-button>
      </el-form-item>
    </el-form>
  }
}
