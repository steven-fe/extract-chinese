<template>
  <i
    :class="[$style.copyIcon, icon]"
    :style="componentStyles"
    @click="click"
  />
</template>
<script>
export default {
  props: {
    text: {
      type: [String, Number],
      default: null
    },
    icon: {
      type: String,
      default: 'el-icon-document-copy'
    },
    iconStyles: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      defaultStyles: {
        fontSize: '12px'
      }
    }
  },
  computed: {
    componentStyles() {
      return { ...this.defaultStyles, ...this.iconStyles }
    }
  },
  methods: {
    click() {
      try {
        const input = document.createElement('textarea')
        input.value = this.text
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        input.parentElement.removeChild(input)
        this.msgSuccess('复制成功')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style lang="scss" module>
.copyIcon {
  cursor: pointer;
}
</style>
