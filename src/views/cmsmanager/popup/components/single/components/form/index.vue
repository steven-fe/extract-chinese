<template>
  <BusinessForm v-if="already" :id="id" ref="form" :type="type" :response-form-data="responseFormData" />
</template>

<script>
import { Message } from 'element-ui'
import * as api from '../../../../api'
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

      const { data } = await api.getItem(this.id)
      this.responseFormData = Object.freeze(data)
    },
    async submit() {
      await this.$refs.form.validate()
      const formData = await this.$refs.form.getRequestFormData()
      await (this.type === 'create' ? api.addItem : api.editItem)(formData)
    }
  }
}
</script>
