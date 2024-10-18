import styles from './index.module.scss'

export default {
  name: 'CustomerSymbolSelect',
  props: {
    spotValue: {
      type: Array,
      required: true
    },
    contractValue: {
      type: Array,
      required: true
    },
    spotList: {
      type: Array,
      required: true
    },
    contractList: {
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
      return ['spot', 'contract'].every(id => {
        return this[`${id}Value`].length > 0 && this[`${id}Value`].length === this[`${id}List`].length
      })
    }
  },
  methods: {
    handleCheckbox(isChecked, id, type) {
      if (id === 'all') {
        return this.$emit('input', isChecked
          ? { spot: this.spotList.map(({ id }) => id), contract: this.contractList.map(({ id }) => id) }
          : { spot: [], contract: [] }
        )
      }

      const value = { spot: [...this.spotValue], contract: [...this.contractValue] }

      if (isChecked && !value[type].includes(id)) value[type].push(id)
      else if (!isChecked && value[type].includes(id)) value[type].splice(value[type].indexOf(id), 1)

      this.$emit('input', value)
    }
  },
  render() {
    return <el-select
      style="display:block;"
      value={this.spotValue.map(symbol => `spot_${symbol}`).concat(this.contractValue.map(symbol => `contract_${symbol}`))}
      disabled={this.disabled}
      multiple
      filterable
      placeholder="请选择"
      on={{
        'remove-tag': id => this.handleCheckbox(false, id.split('_')[1], id.split('_')[0])
      }}
    >
      <el-option key="all" class={styles.option} value="all">
        <el-checkbox value={this.isAll} onChange={(isChecked) => this.handleCheckbox(isChecked, 'all')}>全部</el-checkbox>
      </el-option>

      {
        this.spotList.length > 0 &&
        <el-option-group key="spotGroup" label="现货有效交易对">
          {
            this.spotList.map(({ id, name }) => <el-option key={id} class={styles.option} value={`spot_${id}`}>
              <el-checkbox value={this.spotValue.includes(id)} onChange={(isChecked) => this.handleCheckbox(isChecked, id, 'spot')}>{name}</el-checkbox>
            </el-option>)
          }
        </el-option-group>
      }

      {
        this.contractList.length > 0 &&
        <el-option-group key="contractGroup" label="合约有效交易对">
          {
            this.contractList.map(({ id, name }) => <el-option key={id} class={styles.option} value={`contract_${id}`}>
              <el-checkbox value={this.contractValue.includes(id)} onChange={(isChecked) => this.handleCheckbox(isChecked, id, 'contract')}>{name}</el-checkbox>
            </el-option>)
          }
        </el-option-group>
      }
    </el-select>
  }
}
