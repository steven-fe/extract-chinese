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

      <el-form-item label="交易赛名称">
        <el-input value={this.params.name} placeholder="请输入交易赛名称" clearable size="mini" onInput={name => this.change({ name: name || null })} />
      </el-form-item>

      <el-form-item label="交易赛ID">
        <el-input value={this.params.id} placeholder="请输入交易赛ID" clearable size="mini" onInput={id => this.change({ id: id || null })} />
      </el-form-item>

      <el-form-item label="上线状态">
        <el-date-picker
          props={{
            clearable: true,
            size: 'mini',
            value: this.params.startTime && this.params.endTime ? [new Date(this.params.startTime), new Date(this.params.endTime)] : null,
            type: 'datetimerange',
            format: 'yyyy-MM-dd HH:mm:ss',
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
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'query')}>查找</el-button>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'add')}>添加交易赛</el-button>
      </el-form-item>
    </el-form>
  }
}
