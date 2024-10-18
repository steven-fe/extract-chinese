import styles from './index.module.scss'

export default {
  name: 'Label',
  props: {
    value: {
      type: Array
    },
    max: {
      type: Number,
      default: Infinity
    }
  },
  data() {
    return {
      inputVisible: false,
      inputValue: ''
    }
  },
  methods: {
    handleClose(deletedText) {
      const newValue = [...this.value].filter(text => text !== deletedText)
      this.$emit('input', newValue)
    },
    handleKeyup(event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.handleInputConfirm()
      }
    },
    handleInputConfirm() {
      if (this.inputValue) {
        this.$emit('input', [...new Set(this.value.concat(this.inputValue))])
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  render() {
    return <div class={styles.label}>
      {
        (this.value || []).map((text) => (<el-tag class={styles.tag} key={text} size="normal" disable-transitions closable onClose={() => this.handleClose(text)}>{text}</el-tag>))
      }
      {
        (this.value && this.value.length < this.max) &&
          (
            this.inputVisible
              ? <el-input ref="saveTagInput" class={styles.inputNewTag} value={this.inputValue} size="small" onInput={inputValue => (this.inputValue = inputValue)} nativeOnKeyup={this.handleKeyup} onBlur={this.handleInputConfirm} />
              : <el-button class={styles.buttonNewTag} size="small" onClick={this.showInput}>+ New Tag</el-button>
          )
      }
    </div>
  }
}
