import $data, { stateMap } from '../../data'

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

      <el-form-item label="项目名称">
        <el-input value={this.params.title} placeholder="请输入项目名称" clearable size="mini" onInput={title => this.change({ title: title || null })} />
      </el-form-item>

      <el-form-item label="语言">
        <el-select value={this.params.language} size="mini" filterable clearable placeholder="全部" onInput={language => this.change({ language: language || null })}>
          { $data.languages.valuesList.map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="上线状态">
        <el-select value={this.params.state} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ state: typeof id === 'number' ? id : id || null })}>
          { [...stateMap.values()].map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'query')}>搜索</el-button>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'add')}>+新增</el-button>
      </el-form-item>
    </el-form>
  }
}
