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
      <el-form-item label="用户分类" prop="name">
        <el-input value={this.params.name} placeholder="请输入分类名称/分类代码" clearable size="mini" onInput={$event => this.change({ name: $event })} />
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker
          props={{
            clearable: true,
            size: 'mini',
            value: this.params.startTime && this.params.endTime ? [new Date(this.params.startTime), new Date(this.params.endTime)] : null,
            type: 'datetimerange',
            format: 'yyyy-MM-dd HH:mm',
            'start-placeholder': '开始时间',
            'range-separator': '至',
            'end-placeholder': '结束时间',
            'value-format': 'timestamp',
            'default-time': ['00:00:00', '23:59:59']
          }}
          onInput={$event => this.change(Array.isArray($event) ? { startTime: $event[0], endTime: $event[1] } : { startTime: null, endTime: null })}
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" onClick={this.$emit.bind(this, 'query')}>搜索</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" onClick={this.$emit.bind(this, 'create')}>新增用户分类</el-button>
      </el-form-item>
    </el-form>
  }
}
