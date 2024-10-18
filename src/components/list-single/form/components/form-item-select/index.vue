<template>
  <el-form-item :prop="prop" :label="label" :rules="rules">
    <el-select
      :value="value"
      size="mini"
      filterable
      :clearable="clearable"
      :placeholder="$t('common.pleaseChoose')"
      @input="value => $emit('input', value)"
    >
      <el-option
        v-for="option in options"
        :key="option.type"
        :label="option.label"
        :value="option.type"
      />
    </el-select>
  </el-form-item>
</template>

<script>

export default {
  name: 'FormItemSelect',
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
      type: [String, Number]
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    clearable: {
      type: Boolean,
      default: true
    },
    options: {
      type: Array,
      required: true
    }
  }
}
</script>
