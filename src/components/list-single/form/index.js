import _ from 'lodash'
import FormItemInput from './components/form-item-input'
import FormItemInputNumber from './components/form-item-input-number'
import FormItemRadioGroup from './components/form-item-radio-group'
import FormItemCheckboxGroup from './components/form-item-checkbox-group'
import FormItemSelect from './components/form-item-select'
import FormItemDateRangePicker from './components/form-item-date-range-picker'
import FormItemDatePicker from './components/form-item-date-picker'
import FormItemImageUpload from './components/form-item-image-upload'

export default {
  name: 'Form',
  props: {
    type: {
      type: String, // 'create', 'edit', 'view'
      required: true
    },
    formData: {
      type: [Object],
      required: true
    },
    formItems: {
      type: [Array],
      required: true
    },
    labelPosition: {
      type: String, // 'right' | 'top'
      default: 'right'
    }
  },
  methods: {
    handleInput(prop, value) {
      this.$emit('input', { [prop]: value })
    },
    async validate() {
      await this.$refs.form.validate()
    }
  },
  render(h) {
    const disabled = this.type === 'view'

    return (
      <el-form
        ref="form"
        props={{ model: this.formData }}
        disabled={disabled}
        labelPosition={this.labelPosition}
        labelWidth="auto"
      >
        {this.formItems
          .filter(formItem => !!formItem)
          .map(formItem => {
            const { component, prop, label, rules: _rules, attrs } = formItem
            const rules = this.type === 'view' ? [] : _rules
            const value = _.get(this.formData, prop)

            if (component === 'checkboxGroup') {
              const { options } = attrs
              return (
                <FormItemCheckboxGroup
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  options={options}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'radioGroup') {
              const { options } = attrs
              return (
                <FormItemRadioGroup
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  options={options}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'input') {
              const { trim } = attrs
              return (
                <FormItemInput
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  trim={trim}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'select') {
              const { clearable, options } = attrs
              return (
                <FormItemSelect
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  clearable={clearable}
                  options={options}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'dateRangePicker') {
              const { limit } = attrs
              return (
                <FormItemDateRangePicker
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  limit={limit}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'inputNumber') {
              const {
                min,
                max,
                step,
                stepStrictly,
                placeholder,
                appendText
              } = attrs
              return (
                <FormItemInputNumber
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  min={min}
                  max={max}
                  step={step}
                  stepStrictly={stepStrictly}
                  placeholder={placeholder}
                  appendText={appendText}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'datePicker') {
              const { limit } = attrs
              return (
                <FormItemDatePicker
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  limit={limit}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'imageUpload') {
              const { props = {}} = attrs
              return (
                <FormItemImageUpload
                  key={prop}
                  prop={prop}
                  label={label}
                  value={value}
                  rules={rules}
                  props={{ ...props }}
                  onInput={value => this.handleInput(prop, value)}
                />
              )
            } else if (component === 'custom') {
              const { component, props = {}} = attrs
              return h(component, {
                key: prop,
                props: {
                  prop: prop,
                  label: label,
                  value: value,
                  rules: rules,
                  ...props
                },
                on: {
                  input: value => this.handleInput(formItem.prop, value)
                }
              })
            }
          })}
      </el-form>
    )
  }
}
