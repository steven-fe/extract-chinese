<template>
  <el-form-item :prop="prop" :label="label" :rules="rules">
    <el-date-picker
      :value="value"
      clearable
      size="mini"
      type="datetimerange"
      :start-placeholder="$t('common.startTime')"
      :range-separator="$t('common.toTime')"
      :end-placeholder="$t('common.endTime')"
      value-format="timestamp"
      :default-time="['00:00:00', '23:59:59']"
      :picker-options="{
        disabledDate: (cellDate) => determineDisabledDate(cellDate)
      }"
      @input="value => $emit('input', value)"
    />
  </el-form-item>
</template>

<script>

export default {
  name: 'FormItemDateRangePicker',
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
      type: [Array]
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    limit: {
      type: String,
      default: 'unlimited' // 'unlimited', 'startingToday'
    }
  },
  methods: {
    determineDisabledDate(cellDate) {
      switch (this.limit) {
        case ('startingToday'): {
          const startTimeOfToday = new Date().setHours(0, 0, 0, 0)
          return +cellDate < startTimeOfToday
        }
        case ('unlimited'): {
          return false
        }
        default: {
          throw new Error('No such scene!')
        }
      }
    }
  }
}
</script>
