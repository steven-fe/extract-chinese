import $data, { typeMap, productsStateMap, shelfStateMap, noviceExclusiveStateMap, createTypeStateMap } from '../../data'

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

      <el-form-item label="产品英文编码/产品ID">
        <el-input value={this.params.id} placeholder="请输入产品英文编码/产品ID" clearable size="mini" onInput={id => this.change({ id: id || null })} />
      </el-form-item>

      <el-form-item label="投资币种">
        <el-select value={this.params.inputCurrency} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ inputCurrency: id || null })}>
          { Array.from($data.currencyMap.values()).map(({ id, name, key }) => (<el-option key={key} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="产品类型">
        <el-select value={this.params.type} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ type: typeof id === 'number' ? id : id || null })}>
          { Array.from(typeMap.values()).map(({ id, name, key }) => (<el-option key={key} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="产品状态">
        <el-select value={this.params.productsState} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ productsState: typeof id === 'number' ? id : id || null })}>
          { Array.from(productsStateMap.values()).map(({ id, name, key }) => (<el-option key={key} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="上架状态">
        <el-select value={this.params.shelfState} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ shelfState: typeof id === 'number' ? id : id || null })}>
          { Array.from(shelfStateMap.values()).map(({ id, name, key }) => (<el-option key={key} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="新手专享">
        <el-select value={this.params.noviceExclusive} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ noviceExclusive: typeof id === 'number' ? id : id || null })}>
          { Array.from(noviceExclusiveStateMap.values()).map(({ id, name, key }) => (<el-option key={key} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="创建方式">
        <el-select value={this.params.createWay} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ createWay: typeof id === 'number' ? id : id || null })}>
          { Array.from(createTypeStateMap.values()).map(({ id, name, key }) => (<el-option key={key} label={name} value={id} />)) }
        </el-select>
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
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'query')}>搜索</el-button>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'add')}>+新增</el-button>
      </el-form-item>
    </el-form>
  }
}
