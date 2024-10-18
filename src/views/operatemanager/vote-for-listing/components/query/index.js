import $store from '@/store'
import { stateMap, voteResultMap } from '../../data'

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
      <el-form-item label="活动id">
        <el-input value={this.params.id} placeholder="请输入活动id" clearable size="mini" onInput={id => this.change({ id })} />
      </el-form-item>

      <el-form-item label="活动开启时间">
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

      <el-form-item label="币种">
        <el-select value={this.params.currencyId} size="mini" filterable clearable placeholder="全部" onInput={currencyId => this.change({ currencyId })}>
          { Array.from($store.getters['systemsetting/currencyMap'].values()).map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="活动状态">
        <el-select value={this.params.state} size="mini" filterable clearable placeholder="全部" onInput={state => this.change({ state })}>
          { Array.from(stateMap.values()).map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="投票结果">
        <el-select value={this.params.voteResult} size="mini" filterable clearable placeholder="全部" onInput={voteResult => this.change({ voteResult })}>
          { Array.from(voteResultMap.values()).map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'add')}>添加活动</el-button>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'query')}>查询</el-button>
      </el-form-item>
    </el-form>
  }
}
