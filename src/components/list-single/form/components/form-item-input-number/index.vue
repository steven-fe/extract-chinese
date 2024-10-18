<template>
  <el-form-item :prop="prop" :label="label" :rules="rules">
    <el-input-number
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      :step-strictly="stepStrictly"
      :placeholder="placeholder"
      @change="value => $emit('input', value)"
    />
    <span v-if="appendText" :class="$style.append">{{ appendText }}</span>
  </el-form-item>
</template>

<script>

import { $t } from '@/lang/index'
export default {
  name: 'FormItemInputNumber',
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
      type: [Number],
      default: 0
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    stepStrictly: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: $t(`['common']['pleaseInput']`)
    },
    // eslint-disable-next-line vue/require-default-prop
    appendText: {
      type: String
    }
  }
}
</script>

<style module lang="scss">
.append {
  margin: 0 0 0 10px;
}
</style>
