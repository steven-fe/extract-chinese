<template>
  <BusinessForm
    v-if="already"
    :id="id"
    ref="form"
    :type="type"
    :response-form-data="responseFormData"
  />
</template>

<script>
import { Message } from 'element-ui'
import { addRule, getRule, editRule, downloadErrorExcel } from './api'
import BusinessForm from './components/business-form'

export default {
  name: 'Form',
  components: {
    BusinessForm
  },
  props: {
    type: {
      // 'create', 'edit', 'view'
      type: String,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    id: {
      type: [String, Number]
    }
  },
  data() {
    return {
      already: false,
      responseFormData: null
    }
  },
  async created() {
    await this.initializeFormData()
    this.already = true
  },
  methods: {
    async initializeFormData() {
      if (this.type === 'create') return
      const { data } = await getRule({ id: this.id })
      this.responseFormData = Object.freeze(data)
    },
    handleResponseData(responseData) {
      const { data } = responseData
      const { failContent, failType } = data || {}
      if (failContent && failType) {
        const h = this.$createElement
        const failLabel = failType === 'billExcel' ? '账单ID' : 'UID'
        const message = Message.error({
          message: h('p', { class: 'el-message__content' }, [
            `${failLabel}有误，请`,
            h('el-button', {
              style: 'padding: 0',
              props: { type: 'text' },
              on: {
                click: async() => {
                  const { msg: fileName } = await downloadErrorExcel({ content: failContent, type: failType })
                  this.download(fileName)
                }
              }
            }, '下载错误信息'),
            '并重新上传'
          ]),
          dangerouslyUseHTMLString: true,
          duration: 6 * 1000,
          showClose: true
        })
        this.$once('hook:beforeDestroy', () => message.close())
        throw new Error('[unlock-ruler-management-handleResponseData]: excel error!')
      }
    },
    async submit() {
      await this.$refs.form.validate()
      const formData = this.$refs.form.getRequestFormData()
      const responseData = await (this.type === 'create' ? addRule : editRule)(formData)
      await this.handleResponseData(responseData)
    }
  }
}
</script>
