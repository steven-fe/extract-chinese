export default {
  name: 'FormItemRadioGroup',
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
      type: [String, Number]
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    options: {
      type: Array,
      required: true
    }
  },
  render(h) {
    return <el-form-item prop={this.prop} label={this.label} rules={this.rules}>
      <el-radio-group value={this.value} onInput={value => this.$emit('input', value)}>
        {
          this.options.map(option => <el-radio key={option.type} label={option.type}>{ option.label }</el-radio>)
        }
      </el-radio-group>
    </el-form-item>
  }
}
