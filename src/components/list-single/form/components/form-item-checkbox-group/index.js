export default {
  name: 'FormItemCheckboxGroup',
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: Array,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    options: {
      type: Array, // { value, type, disabled, label }[]
      required: true
    }
  },
  render() {
    return (
      <el-form-item prop={this.prop} label={this.label} rules={this.rules}>
        <el-checkbox-group
          value={this.value}
          onInput={value => this.$emit('input', value)}
        >
          {this.options.map(option => (
            <el-checkbox
              key={option.type}
              label={option.type}
              disabled={option.disabled}
            >
              {option.label}
            </el-checkbox>
          ))}
        </el-checkbox-group>
      </el-form-item>
    )
  }
}
