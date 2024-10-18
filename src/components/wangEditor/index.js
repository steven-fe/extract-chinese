import Core from './core'

export default {
  name: 'CoinstoreEditor',
  data() {
    return {
      active: false
    }
  },
  methods: {
    toggleActive() {
      // When dialog toggle this display state, wangEditor can not be used. So when elDialog disappears, hide wangEditor.

      let elDialog
      let $parent = this.$parent

      while ($parent) {
        if ($parent.$options.name === 'ElDialog') {
          elDialog = $parent
          break
        }
        $parent = $parent.$parent
      }

      if (!elDialog) throw new Error('[CoinstoreEditor]: can not be used in an environment without ElDialog')

      const unwatch = elDialog.$watch('visible', (visible, b) => {
        if (visible === this.active) return // filter invalid value

        if (visible) this.active = true
        else setTimeout(() => (this.active = false), 300) // when elDialog disappears, set this.active
      }, { immediate: true })

      this.$once('hook:beforeDestroy', unwatch)
    }
  },
  created() {
    this.toggleActive()
  },
  render() {
    return this.active ? <Core props={ this.$attrs } on={ this.$listeners } /> : null
  }
}
