<template>
  <Dialog ref="dialog" :width="650" dialog-name="开屏页广告" :submit-loading="submitLoading" @submit="submit" @cancel="cancel">
    <Form :id="id" ref="form" :type="type" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/list-single/dialog'
import { Message } from 'element-ui'
import Form from './components/form'

export default {
  name: 'Single',
  components: {
    Dialog,
    Form
  },
  data() {
    return {
      type: 'create', // 'create', 'edit', 'view'
      id: null, // form id
      submitLoading: false,

      callbackOfClose: Object.freeze(() => { })
    }
  },
  methods: {
    async open({ type, id = null }, callback) {
      this.type = type
      this.id = id
      this.callbackOfClose = callback
      this.$refs.dialog.open({ type })
    },
    close() {
      this.$refs.dialog.close()
      if (this.callbackOfClose) this.callbackOfClose()
    },
    async submit() {
      try {
        this.submitLoading = true

        await this.$refs.form.submit()
        this.close()
        Message.success('操作成功！')
      } finally {
        this.submitLoading = false
      }
    },
    cancel() {
      this.close()
    }
  }
}
</script>
