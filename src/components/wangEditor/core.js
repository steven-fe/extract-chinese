import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'
import PopupManager from 'element-ui/lib/utils/popup/popup-manager'
import emitter from 'element-ui/src/mixins/emitter'
import styles from './index.module.scss'

import '@wangeditor/editor/dist/css/style.css'

const miniEditorHeight = 300

export default {
  name: 'CoinstoreEditor',
  model: {
    prop: 'value',
    event: 'change'
  },
  mixins: [emitter],
  props: {
    value: {
      type: String,
      required: true
    },
    wordLimit: {
      type: Number,
      default: Infinity
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    modalOrPanelZIndex: {
      type: Number
    }
  },
  data() {
    return {
      editor: null,
      toolbarConfig: {
        modalAppendToBody: true,
        excludeKeys: ['group-video', 'fullScreen']
      },
      editorConfig: {
        placeholder: this.placeholder,
        maxLength: this.wordLimit,
        MENU_CONF: {
          uploadImage: {
            server: process.env.VUE_APP_BASE_API + '/coinbull/file/aws/upload/file',
            headers: { Authorization: 'Bearer ' + getToken() },
            fieldName: 'file',
            maxFileSize: 2 * 1024 * 1024,
            maxNumberOfFiles: 6,
            timeout: 3 * 60 * 1000,

            onFailed() {
              Message.error('图片上传失败')
            },
            onSuccess() {
              Message.success('图片上传成功')
            },
            onError() {
              Message.error('图片上传错误')
            },
            customInsert: (result, insertFn) => {
              insertFn(result.data.fullPath)
            }
          }
        }
      },
      mode: 'default', // or 'simple'
      editorHeight: miniEditorHeight
    }
  },
  methods: {
    onEditorCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错

      /** editor modal */
      editor.on('modalOrPanelShow', modalOrPanel => {
        if (modalOrPanel.type !== 'modal') return

        const { $elem: eleList } = modalOrPanel // modal element
        const ele = eleList[0]
        const oldStyle = ele.style
        const zIndex = (typeof this.modalOrPanelZIndex === 'number') ? this.modalOrPanelZIndex : PopupManager.zIndex

        ele.style.cssText = `${oldStyle};left:50%;right:auto;position:fixed;top:50%;transform:translate(-50%,-50%);z-index:${zIndex};`
      })
      editor.on('modalOrPanelHide', () => { /* 隐藏蒙层 */ })

      /** disabled */
      this.$watch('disabled', (disabled) => {
        if (disabled) editor.disable()
        else editor.enable()
      }, { immediate: true })

      /** drag */
      this.$refs.verticalResizeAnchor.addEventListener('mousedown', (down) => {
        down.preventDefault()

        let last = down

        const handleMousemove = (move) => {
          this.editorHeight += move.clientY - last.clientY
          last = move
        }

        const handleMouseup = (move) => {
          document.removeEventListener('mousemove', handleMousemove)
          document.removeEventListener('mouseup', handleMouseup)
        }

        document.addEventListener('mousemove', handleMousemove)
        document.addEventListener('mouseup', handleMouseup)
      })
    }
  },
  watch: {
    value() {
      this.dispatch('ElFormItem', 'el.form.change', [this.value])
    }
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
  render() {
    return <div style="border: 1px solid #ccc;">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        editor={this.editor}
        defaultConfig={this.toolbarConfig}
        mode={this.mode}
      />
      <Editor
        class={styles.editor}
        style={{ height: `${this.editorHeight}px`, 'overflow-y': 'hidden', cursor: this.disabled ? 'not-allowed' : '' }}
        value={this.value}
        defaultConfig={this.editorConfig}
        mode={this.mode}
        onOnChange={editor => {
          const html = editor.getHtml()
          const content = html === '<p><br></p>' ? '' : html // Eliminate the effect of blank lines.
          this.$emit('input', content)
          this.$emit('change', content)
        }}
        onOnCreated={this.onEditorCreated}
        onOnMaxLength={() => Message.error('超出字数限制了！')}
      />

      <div style="display:flex;position:relative;height:34px;">
        { this.wordLimit !== Infinity && !this.disabled &&
          (() => {
            const length = this.editor && this.editor.getText().replace(/\n|\r/mg, '').length || 0
            return <p style="margin:0 0 0 5px;">字符限制：<span style={ this.wordLimit < length ? 'color:red;' : ''}>{length}</span>/{this.wordLimit}</p>
          })()
        }
        <i ref="verticalResizeAnchor" class="el-icon-d-caret" style="position:absolute;right:0;bottom:0;padding:10px 5px;cursor:ns-resize;" />
      </div>
    </div>
  }
}
