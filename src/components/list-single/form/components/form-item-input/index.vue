<template>
  <el-form-item :prop="prop" :label="label" :rules="rules">
    <el-input
      :value="value"
      :placeholder="placeholder"
      clearable
      @input="value => $emit('input', value)"
      @change="value => $emit('input', trim ? value.trim() : value)"
    />
  </el-form-item>
</template>

<script>

import { $t } from '@/lang/index'
export default {
  name: 'FormItemInput',
  props: {
    prop: {
      // prop 可以传递 form-model的属性：model.a.b.c ...
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: [String, Number]
    },
    /**
     * rule:
     *   - trigger: 'change' | 'blur', 未传值就适用所有场景，仅作用于element-ui，不作用AsyncValidator
     *   - required: string为真性值
     */
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    placeholder: {
      type: String,
      default: $t(`['common']['pleaseInput']`)
    },
    trim: {
      type: Boolean,
      default: false
    }
  }
}
</script>
