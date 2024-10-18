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
    return (
      <el-form ref="queryForm" props={{ model: this.params }} inline>
        <el-form-item>
          <el-select
            value={this.params.searchType}
            size="mini"
            placeholder="全部"
            onInput={(searchType) => this.change({ searchType })}
          >
            <el-option key="id" label="复制理财产品ID" value="id" />
            <el-option key="name" label="复制产品名称" value="name" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            value={this.params.searchValue}
            placeholder={
              this.params.searchType === 'id' ? '搜索产品ID' : '搜索产品名称'
            }
            clearable
            size="mini"
            onInput={(searchValue) => this.change({ searchValue: searchValue || null })}
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select
            value={this.params.taskStatus}
            size="mini"
            filterable
            clearable
            placeholder="全部"
            onInput={(taskStatus) => this.change({ taskStatus })}
          >
            <el-option key={0} label="进行中" value={0} />
            <el-option key={1} label="已结束" value={1} />
          </el-select>
        </el-form-item>
        <el-form-item label="任务创建时间">
          <el-date-picker
            props={{
              clearable: true,
              size: 'mini',
              value:
                this.params.startTs && this.params.endTs
                  ? [
                    new Date(this.params.startTs),
                    new Date(this.params.endTs)
                  ]
                  : null,
              type: 'datetimerange',
              format: 'yyyy-MM-dd HH:mm',
              'start-placeholder': '开始时间',
              'range-separator': '至',
              'end-placeholder': '结束时间',
              'value-format': 'timestamp',
              'default-time': ['00:00:00', '23:59:59']
            }}
            onInput={($event) =>
              this.change(
                Array.isArray($event)
                  ? { startTs: $event[0], endTs: $event[1] }
                  : { startTs: null, endTs: null }
              )
            }
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            onClick={this.$emit.bind(this, 'query')}
          >
            搜索
          </el-button>
          <el-button
            type="primary"
            size="mini"
            onClick={this.$emit.bind(this, 'add')}
          >
            +新增
          </el-button>
        </el-form-item>
      </el-form>
    )
  }
}
