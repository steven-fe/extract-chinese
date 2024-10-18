<template>
  <el-form-item ref="formItem" :prop="prop" :label="label" :rules="rules">
    <el-radio-group :value="limitUidType" @input="type => handleInput({ type, value: { uidFile: null } } )">
      <el-radio
        v-for="option in options"
        :key="option.type"
        :label="option.type"
      >{{ option.label }}</el-radio>
    </el-radio-group>

    <UploadFile
      v-if="limitUidType === 'yes'"
      :initial-file-path="limitUidValue.uidFilePath"
      template-url="https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/UID.xls"
      @add="uidFile => handleInput({ type: limitUidType, value: { uidFile } })"
      @remove="() => handleInput({ type: limitUidType })"
    />
  </el-form-item>
</template>

<script>
import UploadFile from '../upload-file'
import { whether } from '../../../../../../../data'

export default {
  name: 'LimitUid',
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
      type: Object // { type: 'yes' | 'no', value?: { uidFile: File } | { uidFilePath: string }}
    },
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array]
  },
  data() {
    return {
      options: Object.freeze(whether.list)
    }
  },
  computed: {
    limitUidType() {
      return this.value.type
    },
    limitUidValue() {
      return this.value.value || {}
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
      this.$refs.formItem.onFieldChange()
    }
  }
}
</script>
