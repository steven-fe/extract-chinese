import $store from '@/store'

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
    const currencyMap = $store.getters['systemsetting/currencyMap']

    return <el-form ref="queryForm" props={ { model: this.params } } inline>

      <el-form-item label="币种代码">
        <el-select value={this.params.currencyName} size="mini" filterable clearable placeholder="全部" onInput={id => this.change({ currencyName: id ? currencyMap.get(id).name : null })}>
          { Array.from(currencyMap.values()).map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'query')}>搜索</el-button>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'add')}>+新增理财币种</el-button>
      </el-form-item>
    </el-form>
  }
}
