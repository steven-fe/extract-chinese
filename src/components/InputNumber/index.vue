<template>
  <div :class="$style['i-inputNumber']">
    <el-input-number
      v-model="initValue"
      v-bind="$attrs"
      :controls="controls"
      v-on="$listeners"
    />
  </div>
</template>
<script>
export default {
  model: {
    prop: 'numberValue',
    event: 'change'
  },
  props: {
    numberValue: {
      type: [Number, String],
      default: undefined
    },
    controls: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      initValue: undefined
    }
  },
  watch: {
    numberValue(newValue) {
      if (typeof newValue === 'number') {
        this.initValue = newValue
      } else {
        this.initValue = undefined
      }
    }
  }
}
</script>
<style lang="scss" module>
.i-inputNumber {
  :global(.el-input__inner) {
    text-align: left;
  }
}
</style>
