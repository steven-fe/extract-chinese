<template>
  <el-form-item :prop="prop" :label="label" :rules="rules">
    <el-date-picker
      :value="value"
      clearable
      size="mini"
      type="datetime"
      value-format="timestamp"
      placeholder="选择日期时间"
      :picker-options="{
        disabledDate: (cellDate) => determineDisabledDate(cellDate)
      }"
      @input="value => $emit('input', value)"
    />
  </el-form-item>
</template>

<script>

export default {
  name: 'FormItemDatePicker',
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: [Number]
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    limit: {
      type: [String, Array],
      default: 'unlimited' // 'unlimited', 'startingToday', [startTimestamp, endTimestamp]
    }
  },
  methods: {
    determineDisabledDate(cellDate) {
      switch (true) {
        case (this.limit === 'startingToday'): {
          const startTimeOfToday = new Date().setHours(0, 0, 0, 0)
          return +cellDate < startTimeOfToday
        }
        case (this.limit === 'unlimited'): {
          return false
        }
        case (Array.isArray(this.limit)): {
          const startTimestamp = this.limit[0] === -Infinity ? -Infinity : new Date(this.limit[0]).setHours(0, 0, 0, 0)
          const endTimestamp = this.limit[1] === Infinity ? Infinity : new Date(this.limit[1]).setHours(23, 59, 59, 999)
          return +cellDate < startTimestamp || endTimestamp < +cellDate
        }
        default: {
          throw new Error('No such scene!')
        }
      }
    }
  }
}
</script>
