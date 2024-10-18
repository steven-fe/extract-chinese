import styles from './index.module.scss'

export default {
  name: 'SymbolSelect',
  props: {
    defaultTradingSymbol: {
      type: String,
      required: true
    },
    value: {
      type: Array,
      required: true
    },
    list: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
    }
  },
  computed: {
    isAll() {
      return this.value.length > 0 && this.value.length === this.list.length
    }
  },
  methods: {
    removeInvalidDefaultTradingSymbol() {
      this.$watch('value', () => {
        if (this.defaultTradingSymbol && !this.value.includes(this.defaultTradingSymbol)) {
          this.$emit('setDefaultSymbol', '')
        }
      }, { immediate: true })
    },
    handleCheckbox(isChecked, id) {
      if (id === 'all') return this.$emit('input', isChecked ? this.list.map(({ id }) => id) : [])

      const newValue = [...this.value]

      if (isChecked && !this.value.includes(id)) newValue.push(id)
      else if (!isChecked && this.value.includes(id)) newValue.splice(newValue.indexOf(id), 1)

      this.$emit('input', newValue)
    }
  },
  created() {
    this.removeInvalidDefaultTradingSymbol()
  },
  render() {
    return <el-select
      style="display:block;"
      value={this.value}
      disabled={this.disabled}
      multiple
      filterable
      placeholder="请选择"
      on={{
        'remove-tag': id => this.handleCheckbox(false, id)
      }}
    >
      {
        [{ id: 'all', name: '全部' }]
          .concat(this.list)
          .map(({ id, name }) => <el-option key={id} class={styles.option} value={id}>
            <el-checkbox value={id === 'all' ? this.isAll : this.value.includes(id)} onChange={(isChecked) => this.handleCheckbox(isChecked, id)}>{name}</el-checkbox>

            { (() => {
              if (id === 'all') {
                return <el-tooltip class="item" effect="dark" content="现货和合约有效交易币对，一共只能选择一个默认跳转币对。" placement="top">
                  <span>默认跳转 <i class="el-icon-info" /></span>
                </el-tooltip>
              }

              return this.value.includes(id)
                ? <div style="padding:0 20px;color:#606266;event-pointer:cursor;" onClick={(event) => {
                  event.stopPropagation()
                  this.$emit('setDefaultSymbol', this.defaultTradingSymbol === id ? '' : id)
                }}>
                  { this.defaultTradingSymbol === id ? <i class="el-icon-star-on" /> : <i class="el-icon-star-off" /> }
                </div>
                : null
            })() }
          </el-option>)
      }
    </el-select>
  }
}
