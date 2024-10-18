<template>
  <el-form-item ref="formItem" :prop="prop" :label="label" :rules="rules">
    <el-input :value="value" :placeholder="placeholder" @click.native="handleUpload" />
    <p v-if="tips" v-html="tips" />
  </el-form-item>
</template>

<script>
import { uploadImage } from '@/utils/upload-image'
import { Message } from 'element-ui'
import { filesize } from 'filesize'

export default {
  name: 'FormItemImageUpload',
  props: {
    prop: {
      // prop 可以传递 form-model的属性：model.a.b.c ...
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: String
    },
    /**
     * rule:
     *   - trigger: 'change' | 'blur', 未传值就适用所有场景，仅作用于element-ui，不作用AsyncValidator
     *   - required: string为真性值
     */
    // eslint-disable-next-line vue/require-default-prop
    rules: [Object, Array],
    // eslint-disable-next-line vue/require-default-prop
    accept: {
      type: [String, undefined]
    },
    // eslint-disable-next-line vue/require-default-prop
    volume: {
      type: [Array, undefined] // unit is byte
    },
    placeholder: {
      type: String,
      default: '请上传图片'
    },
    tips: {
      type: String,
      default: ''
    }
  },
  methods: {
    async handleUpload() {
      try {
        const value = await uploadImage({ accept: this.accept, volume: this.volume })
        this.$emit('input', value)
        this.$refs.formItem.onFieldChange()
      } catch (e) {
        if (e.message === '[UploadImage-WrongImageVolume]: volume is to large') Message.warning(`图片最大限制${filesize(this.volume[1], { standard: 'jedec' })}`)
      }
    }
  }
}
</script>
