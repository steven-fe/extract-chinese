<template>
  <el-form-item ref="formItem" :prop="prop" :label="label" :rules="rules">
    <UploadFile
      :initial-file-path="value ? value.billFilePath : null"
      template-url="https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/BillTemplate.xls"
      @add="billFile => handleInput({ billFile })"
      @remove="() => handleInput(null)"
    />
  </el-form-item>
</template>

<script>
import UploadFile from '../upload-file'

export default {
  name: 'BillFile',
  components: {
    UploadFile
  },
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: Object // null | { billFile: File } | { billFilePath: string }
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array]
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
      this.$refs.formItem.onFieldChange()
    }
  }
}
</script>
