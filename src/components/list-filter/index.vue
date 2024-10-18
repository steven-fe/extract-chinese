<template>
  <el-form ref="queryForm" :model="params" :inline="true">
    <el-form-item v-for="item in items" :key="item.prop" :label="item.label">
      <el-input
        v-if="item.component === 'textInput'"
        :value="params[item.prop]"
        clearable
        size="mini"
        :placeholder="item.attrs.placeholder"
        @input="(text) => textInputChange(item.prop, text, item.attrs.valueType)"
        @change="(text) => change(item.prop, item.attrs.trim ? text.trim() : text)"
      />

      <el-date-picker
        v-else-if="item.component === 'datePicker'"
        :value="params[item.prop]"
        clearable
        size="mini"
        type="datetimerange"
        :start-placeholder="$t('common.startTime')"
        :range-separator="$t('common.toTime')"
        :end-placeholder="$t('common.endTime')"
        value-format="timestamp"
        :default-time="['00:00:00', '23:59:59']"
        @input="(data) => change(item.prop, data)"
      />

      <el-select
        v-else-if="item.component === 'select'"
        :value="params[item.prop]"
        size="mini"
        filterable
        clearable
        :placeholder="$t('common.all')"
        @input="(data) => change(item.prop, data)"
      >
        <el-option
          v-for="option in item.attrs.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <strong v-else>请配置 type 属性！！</strong>
    </el-form-item>

    <el-form-item>
      <el-button
        v-for="button in footer"
        :key="button.id"
        :type="button.type || 'primary'"
        size="mini"
        @click="handleButtonClick(button.id)"
      >{{ button.name }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import _ from 'lodash'
import { Message } from 'element-ui'

export default {
  name: 'ListFilter',
  props: {
    params: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    footer: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      initialParams: {}
    }
  },
  created() {
    this.saveInitialParams()
  },
  methods: {
    saveInitialParams() {
      this.initialParams = _.cloneDeep(this.params)
    },
    textInputChange(id, value, valueType) {
      switch (valueType) {
        case 'integer': {
          if (!!value && !(/^\d+$/.test(value))) {
            Message.error('只能输入整数！')
            return
          }
          break
        }
      }
      this.change(id, value)
    },
    change(id, _value) {
      const value = typeof _value === 'number' ? _value : _value || null
      this.$emit('change', { [id]: value })
    },
    handleButtonClick(id) {
      switch (id) {
        case 'reset': {
          for (const key in this.initialParams) this.change(key, this.initialParams[key])
          break
        }
        default: {
          this.$emit(`button-click-${id}`)
        }
      }
    }
  }
}
</script>

<style lang="scss" module>
</style>
