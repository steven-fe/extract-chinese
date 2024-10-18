export default {
  name: 'DatePicker',
  props: {
    dateRange: {
      type: [Array],
      required: true
    },
    disabled: {
      type: [String, Boolean] // true, false, 'startTime', 'endTime'
    }
  },
  computed: {
    startTime() {
      return this.dateRange[0]
    },
    endTime() {
      return this.dateRange[1]
    }
  },
  render() {
    if (this.disabled === 'startTime' || this.disabled === 'endTime') {
      return <div>
        <el-date-picker value={this.startTime} type="datetime" disabled={this.disabled === 'startTime'} />
        &nbsp;至&nbsp;
        <el-date-picker
          value={this.endTime}
          type="datetime"
          value-format="timestamp"
          disabled={this.disabled === 'endTime'}
          pickerOptions={{ disabledDate: time => +time <= this.startTime }}
          onInput={endTime => this.$emit('input', [this.startTime, endTime])}
        />
      </div>
    }

    return <el-date-picker
      props={{
        clearable: true,
        value: this.startTime && this.endTime ? [new Date(this.startTime), new Date(this.endTime)] : null,
        disabled: this.disabled,
        type: 'datetimerange',
        format: 'yyyy-MM-dd HH:mm:ss',
        'start-placeholder': '开始时间',
        'range-separator': '至',
        'end-placeholder': '结束时间',
        'value-format': 'timestamp',
        'default-time': ['00:00:00', '23:59:59']
      }}
      onInput={dateRange => {
        const startTime = Array.isArray(dateRange) ? dateRange[0] : null
        const endTime = Array.isArray(dateRange) ? dateRange[1] : null
        this.$emit('input', [startTime, endTime])
      }}
    />
  }
}
