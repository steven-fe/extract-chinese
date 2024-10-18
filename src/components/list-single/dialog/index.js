import { destroyComponent } from '@/utils/component'
import Footer from './components/footer'

export default {
  name: 'Dialog',
  props: {
    width: {
      type: Number,
      default: 500
    },
    dialogName: {
      type: String,
      required: true
    },
    submitLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,

      type: 'create' // 'create', 'edit', 'view'
    }
  },
  computed: {
    dialogTitle() {
      if (this.type === 'create') return `新增${this.dialogName}`
      else if (this.type === 'edit') return `编辑${this.dialogName}`
      else if (this.type === 'view') return `查看${this.dialogName}`
      throw new Error('No such scene!')
    }
  },
  methods: {
    open({ type }) {
      this.visible = true
      this.type = type
    },
    close() {
      this.visible = false
    },
    closed() {
      destroyComponent(this)
    }
  },
  render() {
    return <el-dialog
      title={this.dialogTitle}
      width={`${this.width}px`}
      closeOnClickModal={this.type === 'view'}
      closeOnPressEscape={this.type === 'view'}
      showClose={this.type === 'view'}
      visible={this.visible}
      onClosed={this.closed}
      on={{ 'update:visible': (visible) => (this.visible = visible) }}
    >
      { !!this.$scopedSlots.default && this.$scopedSlots.default() }

      {
        (() => {
          if (this.type === 'view') return null

          return this.$scopedSlots.footer
            ? this.$scopedSlots.footer()
            : <Footer slot="footer" submitLoading={this.submitLoading} onSubmit={() => this.$emit('submit')} onCancel={() => this.$emit('cancel')} />
        })()
      }
    </el-dialog>
  }
}
