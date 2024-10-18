<template>
  <div :class="$style['i-select']">
    <el-select
      ref="selectRef"
      v-model="defaultValue"
      v-loadmore="loadMore"
      :placeholder="$t('common.pleaseChoose')"
      v-bind="$attrs"
      :style="{
        width: width
      }"
      v-on="$listeners"
    >
      <Option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :width="isSetWhiteSpace ? selectWidth : 'auto'"
        :disabled="item.disabled"
        :white-space-type="whiteSpaceType"
      />
    </el-select>
  </div>
</template>
<script>
import Option from './Option'
export default {
  components: {
    Option
  },
  directives: {
    loadmore: {
      bind(el, binding) {
        const SELECT_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        SELECT_DOM.addEventListener('scroll', function() {
          const condition = this.scrollHeight - this.scrollTop <= this.clientHeight
          if (condition) binding.value()
        })
      }
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      required: true,
      type: null,
      default: null
    },
    options: {
      required: true,
      type: Array,
      default: () => []
    },
    whiteSpaceType: {
      type: String,
      default: 'initial'
    },
    width: {
      type: String,
      default: '200px'
    },
    isSetWhiteSpace: {
      type: Boolean,
      default: true
    },
    isMoreData: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultValue: null,
      selectWidth: null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function(newValue) {
        this.defaultValue = newValue
      }
    }
  },
  mounted() {
    this.selectWidth = window.getComputedStyle(this.$refs.selectRef.$el).width
  },
  methods: {
    // 触底  加载更多
    loadMore() {
      if (this.isMoreData) {
        this.$emit('loadmore')
      }
    }
  }
}
</script>
<style lang="scss" module>
.i-select {
  :global(.el-input__inner) {
    text-align: left;
  }
}
</style>
