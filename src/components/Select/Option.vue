<template>
  <el-option
    :class="$style[optionClass]"
    :style="`width: ${width}`"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
<script>
export default {
  props: {
    width: {
      type: String,
      default: '100%'
    },
    whiteSpaceType: {
      type: String,
      default: 'initial'
    }
  },
  computed: {
    optionClass() {
      if (this.whiteSpaceType.indexOf('initial') !== -1 || this.whiteSpaceType.indexOf('nowrap') !== -1) {
        return `select-item-${this.whiteSpaceType}`
      } else {
        return `select-item-initial`
      }
    },
    toolTipDisabled() {
      return !!this.$attrs.label === 'nowrap'
    }
  }
}
</script>
<style lang="scss" module>
.select-item-initial {
  min-height: 35px;
  height: auto;
  white-space: initial;
  overflow: hidden;
  text-overflow: initial;
}

.select-item-nowrap {
  min-height: 35px;
  height: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
